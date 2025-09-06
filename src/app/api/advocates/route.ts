import { advocateService } from "./services/advocate.service";
import { handleApiError, ValidationError } from "./utils/api-error";
import type { SearchAdvocatesRequest } from "./types/advocate.types";

/**
 * GET /api/advocates
 * 
 * Search and retrieve advocates with pagination
 * 
 * Query Parameters:
 * - search: Search term for full-text search
 * - page: Page number (default: 1)
 * - limit: Results per page (default: 50, max: 100)
 * - sortBy: Sort field (relevance|name|experience|city)
 * - sortOrder: Sort order (asc|desc)
 * 
 * @returns {SearchAdvocatesResponse} Paginated list of advocates
 */
export async function GET(request: Request) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    
    // Validate and transform parameters
    const searchRequest: SearchAdvocatesRequest = {
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      sortBy: searchParams.get('sortBy') as any || undefined,
      sortOrder: searchParams.get('sortOrder') as any || undefined
    };

    // Validate numeric parameters
    if (searchRequest.page !== undefined && (isNaN(searchRequest.page) || searchRequest.page < 1)) {
      throw new ValidationError('Invalid page parameter');
    }
    
    if (searchRequest.limit !== undefined && (isNaN(searchRequest.limit) || searchRequest.limit < 1)) {
      throw new ValidationError('Invalid limit parameter');
    }

    // Call service layer
    const response = await advocateService.searchAdvocates(searchRequest);

    // Return successful response
    return Response.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=60', // Cache for 1 minute
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}

