import { useState, useCallback, useEffect } from 'react';
import { Advocate, Pagination } from '@/types/advocate';

interface UseAdvocatesResult {
  advocates: Advocate[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  selectedSpecialties: string[];
  pagination: Pagination | null;
  setSearchTerm: (term: string) => void;
  setSelectedSpecialties: (specialties: string[]) => void;
  handlePageChange: (page: number) => void;
  handleLimitChange: (limit: number) => void;
  refresh: () => void;
}

export function useAdvocates(initialLimit: number = 50): UseAdvocatesResult {
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  const fetchAdvocates = useCallback(async (
    search: string, 
    specialties: string[] = [],
    page: number = 1, 
    limit: number = initialLimit
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (specialties.length > 0) {
        params.append('specialties', specialties.join(','));
      }
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/api/advocates?${params}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch advocates: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Handle both camelCase and snake_case from API
      const normalizedData = data.data?.map((advocate: any) => ({
        id: advocate.id,
        firstName: advocate.firstName || advocate.first_name,
        lastName: advocate.lastName || advocate.last_name,
        city: advocate.city,
        degree: advocate.degree,
        specialties: advocate.specialties || advocate.payload || [],
        yearsOfExperience: advocate.yearsOfExperience || advocate.years_of_experience,
        phoneNumber: advocate.phoneNumber || advocate.phone_number,
      })) || [];
      
      setAdvocates(normalizedData);
      setPagination(data.pagination || null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch advocates';
      setError(errorMessage);
      console.error("Failed to fetch advocates:", err);
    } finally {
      setLoading(false);
    }
  }, [initialLimit]);

  // Initial load
  useEffect(() => {
    fetchAdvocates("", [], 1, initialLimit);
  }, [fetchAdvocates, initialLimit]);

  // Debounced search and specialty filter
  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const newTimer = setTimeout(() => {
      fetchAdvocates(searchTerm, selectedSpecialties, 1, pagination?.limit || initialLimit);
    }, 300);

    setDebounceTimer(newTimer);

    return () => {
      if (newTimer) clearTimeout(newTimer);
    };
  }, [searchTerm, selectedSpecialties, fetchAdvocates, pagination?.limit, initialLimit]);

  // Handle search term change
  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  // Handle specialty selection change
  const handleSpecialtiesChange = useCallback((specialties: string[]) => {
    setSelectedSpecialties(specialties);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    fetchAdvocates(searchTerm, selectedSpecialties, newPage, pagination?.limit || initialLimit);
  }, [fetchAdvocates, searchTerm, selectedSpecialties, pagination?.limit, initialLimit]);

  const handleLimitChange = useCallback((newLimit: number) => {
    fetchAdvocates(searchTerm, selectedSpecialties, 1, newLimit);
  }, [fetchAdvocates, searchTerm, selectedSpecialties]);

  const refresh = useCallback(() => {
    fetchAdvocates(searchTerm, selectedSpecialties, pagination?.page || 1, pagination?.limit || initialLimit);
  }, [fetchAdvocates, searchTerm, selectedSpecialties, pagination, initialLimit]);

  return {
    advocates,
    loading,
    error,
    searchTerm,
    selectedSpecialties,
    pagination,
    setSearchTerm: handleSearchChange,
    setSelectedSpecialties: handleSpecialtiesChange,
    handlePageChange,
    handleLimitChange,
    refresh,
  };
}