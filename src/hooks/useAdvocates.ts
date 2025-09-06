import { useState, useCallback, useEffect } from 'react';
import { Advocate, Pagination } from '@/types/advocate';

interface UseAdvocatesResult {
  advocates: Advocate[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  pagination: Pagination | null;
  setSearchTerm: (term: string) => void;
  handlePageChange: (page: number) => void;
  handleLimitChange: (limit: number) => void;
  refresh: () => void;
}

export function useAdvocates(initialLimit: number = 50): UseAdvocatesResult {
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  const fetchAdvocates = useCallback(async (search: string, page: number = 1, limit: number = initialLimit) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      
      const response = await fetch(`/api/advocates?${params}`);
      
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
    fetchAdvocates("", 1, initialLimit);
  }, [fetchAdvocates, initialLimit]);

  // Debounced search
  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);

    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const newTimer = setTimeout(() => {
      fetchAdvocates(term, 1, pagination?.limit || initialLimit);
    }, 300);

    setDebounceTimer(newTimer);
  }, [debounceTimer, fetchAdvocates, pagination?.limit, initialLimit]);

  const handlePageChange = useCallback((newPage: number) => {
    fetchAdvocates(searchTerm, newPage, pagination?.limit || initialLimit);
  }, [fetchAdvocates, searchTerm, pagination?.limit, initialLimit]);

  const handleLimitChange = useCallback((newLimit: number) => {
    fetchAdvocates(searchTerm, 1, newLimit);
  }, [fetchAdvocates, searchTerm]);

  const refresh = useCallback(() => {
    fetchAdvocates(searchTerm, pagination?.page || 1, pagination?.limit || initialLimit);
  }, [fetchAdvocates, searchTerm, pagination, initialLimit]);

  return {
    advocates,
    loading,
    error,
    searchTerm,
    pagination,
    setSearchTerm: handleSearchChange,
    handlePageChange,
    handleLimitChange,
    refresh,
  };
}