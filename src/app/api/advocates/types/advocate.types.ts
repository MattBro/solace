// Domain Types
export interface Advocate {
  id: number;
  firstName: string;
  lastName: string;
  city: string;
  degree: string;
  specialties: string[];
  yearsOfExperience: number;
  phoneNumber: number;
  createdAt?: Date;
}

// Database Types
export interface AdvocateDB {
  id: number;
  first_name: string;
  last_name: string;
  city: string;
  degree: string;
  payload: string[] | any; // jsonb from postgres
  years_of_experience: number;
  phone_number: number;
  created_at?: Date;
  search_vector?: string;
  rank?: number;
}

// DTOs (Data Transfer Objects)
export interface SearchAdvocatesRequest {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'relevance' | 'name' | 'experience' | 'city';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

export interface SearchAdvocatesResponse {
  data: Advocate[];
  pagination: PaginationInfo;
}

// Repository Response
export interface AdvocateSearchResult {
  advocates: AdvocateDB[];
  totalCount: number;
}