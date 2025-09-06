import { Injectable, Logger } from '@nestjs/common';
import { AdvocateRepository } from './advocates.repository';
import { SearchAdvocatesDto } from './dto/search-advocates.dto';
import type {
  Advocate,
  AdvocateDB,
  SearchAdvocatesResponse,
  PaginationInfo
} from './interfaces/advocate.interface';

@Injectable()
export class AdvocatesService {
  private readonly logger = new Logger(AdvocatesService.name);
  private readonly DEFAULT_PAGE = 1;
  private readonly DEFAULT_LIMIT = 50;
  private readonly MAX_LIMIT = 100;

  constructor(private advocateRepository: AdvocateRepository) {}

  private transformAdvocate(dbAdvocate: any): Advocate {
    return {
      id: dbAdvocate.id,
      firstName: dbAdvocate.first_name,
      lastName: dbAdvocate.last_name,
      city: dbAdvocate.city,
      degree: dbAdvocate.degree,
      specialties: dbAdvocate.specialties || [],
      yearsOfExperience: dbAdvocate.years_of_experience,
      phoneNumber: dbAdvocate.phone_number,
      createdAt: dbAdvocate.created_at
    };
  }

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

  async searchAdvocates(
    request: SearchAdvocatesDto
  ): Promise<SearchAdvocatesResponse> {
    try {
      const { page, limit, offset } = this.validatePagination(
        request.page,
        request.limit
      );

      let advocates: AdvocateDB[];
      let totalCount: number;

      if (request.specialties && request.specialties.length > 0) {
        const result = await this.advocateRepository.getAdvocatesBySpecialties(
          request.specialties,
          request.search?.trim() || '',
          limit,
          offset
        );
        advocates = result.advocates;
        totalCount = result.totalCount;
      } else if (request.search && request.search.trim()) {
        const searchResult = await this.advocateRepository.searchAdvocates(
          request.search.trim(),
          limit,
          offset
        );
        advocates = searchResult.advocates;
        totalCount = searchResult.totalCount;
      } else {
        const allAdvocatesResult = await this.advocateRepository.getAllAdvocates(
          limit,
          offset
        );
        advocates = allAdvocatesResult.advocates;
        totalCount = allAdvocatesResult.totalCount;
      }

      const transformedAdvocates = advocates.map(advocate =>
        this.transformAdvocate(advocate)
      );

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
      this.logger.error('Error in advocate service:', error);
      throw new Error('Failed to search advocates');
    }
  }

  async getAdvocateById(id: number): Promise<Advocate | null> {
    try {
      const advocate = await this.advocateRepository.getAdvocateById(id);
      
      if (!advocate) {
        return null;
      }

      return this.transformAdvocate(advocate);
    } catch (error) {
      this.logger.error('Error fetching advocate:', error);
      throw new Error('Failed to fetch advocate');
    }
  }

  async getAdvocatesBySpecialty(
    specialty: string,
    page?: number,
    limit?: number
  ): Promise<SearchAdvocatesResponse> {
    try {
      const { page: validPage, limit: validLimit, offset } = this.validatePagination(page, limit);

      const result = await this.advocateRepository.getAdvocatesBySpecialty(
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
      this.logger.error('Error fetching advocates by specialty:', error);
      throw new Error('Failed to fetch advocates by specialty');
    }
  }
}