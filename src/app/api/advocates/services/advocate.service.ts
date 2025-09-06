import { advocateRepository } from "../repositories/advocate.repository";
import type {
  Advocate,
  AdvocateDB,
  SearchAdvocatesRequest,
  SearchAdvocatesResponse,
  PaginationInfo
} from "../types/advocate.types";

export class AdvocateService {
  private readonly DEFAULT_PAGE = 1;
  private readonly DEFAULT_LIMIT = 50;
  private readonly MAX_LIMIT = 100;

  /**
   * Transform database advocate to API advocate
   * Converts snake_case fields to camelCase
   */
  private transformAdvocate(dbAdvocate: any): Advocate {
    // Handle both direct DB results and raw SQL results
    return {
      id: dbAdvocate.id,
      firstName: dbAdvocate.firstName || dbAdvocate.first_name,
      lastName: dbAdvocate.lastName || dbAdvocate.last_name,
      city: dbAdvocate.city,
      degree: dbAdvocate.degree,
      specialties: dbAdvocate.specialties || dbAdvocate.payload || [],
      yearsOfExperience: dbAdvocate.yearsOfExperience || dbAdvocate.years_of_experience,
      phoneNumber: dbAdvocate.phoneNumber || dbAdvocate.phone_number,
      createdAt: dbAdvocate.createdAt || dbAdvocate.created_at
    };
  }

  /**
   * Calculate pagination information
   */
  private calculatePagination(
    page: number,
    limit: number,
    totalCount: number
  ): PaginationInfo {
    const totalPages = Math.ceil(totalCount / limit);
    
    return {
      page,
      limit,
      totalCount,
      totalPages
    };
  }

  /**
   * Validate and sanitize pagination parameters
   */
  private validatePagination(page?: number, limit?: number): {
    page: number;
    limit: number;
    offset: number;
  } {
    const validPage = Math.max(1, page || this.DEFAULT_PAGE);
    const validLimit = Math.min(
      this.MAX_LIMIT,
      Math.max(1, limit || this.DEFAULT_LIMIT)
    );
    const offset = (validPage - 1) * validLimit;

    return {
      page: validPage,
      limit: validLimit,
      offset
    };
  }

  /**
   * Search advocates with optional filters and pagination
   */
  async searchAdvocates(
    request: SearchAdvocatesRequest
  ): Promise<SearchAdvocatesResponse> {
    try {
      const { page, limit, offset } = this.validatePagination(
        request.page,
        request.limit
      );

      let advocates: AdvocateDB[];
      let totalCount: number;

      if (request.search && request.search.trim()) {
        // Use full-text search if search term provided
        const searchResult = await advocateRepository.searchAdvocates(
          request.search.trim(),
          limit,
          offset
        );
        advocates = searchResult.advocates;
        totalCount = searchResult.totalCount;
      } else {
        // Return all advocates if no search term
        const allAdvocatesResult = await advocateRepository.getAllAdvocates(
          limit,
          offset
        );
        advocates = allAdvocatesResult.advocates;
        totalCount = allAdvocatesResult.totalCount;
      }

      // Transform database models to API models
      const transformedAdvocates = advocates.map(advocate =>
        this.transformAdvocate(advocate)
      );

      // Apply additional sorting if requested
      if (request.sortBy && request.sortBy !== 'relevance') {
        transformedAdvocates.sort((a, b) => {
          const order = request.sortOrder === 'desc' ? -1 : 1;
          
          switch (request.sortBy) {
            case 'name':
              return order * a.lastName.localeCompare(b.lastName);
            case 'experience':
              return order * (a.yearsOfExperience - b.yearsOfExperience);
            case 'city':
              return order * a.city.localeCompare(b.city);
            default:
              return 0;
          }
        });
      }

      return {
        data: transformedAdvocates,
        pagination: this.calculatePagination(page, limit, totalCount)
      };
    } catch (error) {
      console.error('Error in advocate service:', error);
      throw new Error('Failed to search advocates');
    }
  }

  /**
   * Get a single advocate by ID
   */
  async getAdvocateById(id: number): Promise<Advocate | null> {
    try {
      const advocate = await advocateRepository.getAdvocateById(id);
      
      if (!advocate) {
        return null;
      }

      return this.transformAdvocate(advocate);
    } catch (error) {
      console.error('Error fetching advocate:', error);
      throw new Error('Failed to fetch advocate');
    }
  }

  /**
   * Get advocates by specialty
   */
  async getAdvocatesBySpecialty(
    specialty: string,
    page?: number,
    limit?: number
  ): Promise<SearchAdvocatesResponse> {
    try {
      const { page: validPage, limit: validLimit, offset } = this.validatePagination(page, limit);

      const result = await advocateRepository.getAdvocatesBySpecialty(
        specialty,
        validLimit,
        offset
      );

      const transformedAdvocates = result.advocates.map(advocate =>
        this.transformAdvocate(advocate)
      );

      return {
        data: transformedAdvocates,
        pagination: this.calculatePagination(validPage, validLimit, result.totalCount)
      };
    } catch (error) {
      console.error('Error fetching advocates by specialty:', error);
      throw new Error('Failed to fetch advocates by specialty');
    }
  }

  /**
   * Validate search parameters
   */
  validateSearchParams(params: any): SearchAdvocatesRequest {
    return {
      search: params.search || '',
      page: parseInt(params.page) || this.DEFAULT_PAGE,
      limit: parseInt(params.limit) || this.DEFAULT_LIMIT,
      sortBy: params.sortBy || 'relevance',
      sortOrder: params.sortOrder || 'desc'
    };
  }
}

// Export singleton instance
export const advocateService = new AdvocateService();