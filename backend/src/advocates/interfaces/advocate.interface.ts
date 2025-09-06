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

export interface AdvocateDB {
  id: number;
  first_name: string;
  last_name: string;
  city: string;
  degree: string;
  payload: string[];
  years_of_experience: number;
  phone_number: number;
  created_at?: Date;
}

export interface AdvocateSearchResult {
  advocates: AdvocateDB[];
  totalCount: number;
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