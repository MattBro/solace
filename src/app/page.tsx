"use client";

import { useEffect, useState, useCallback } from "react";

interface Advocate {
  id: number;
  firstName: string;
  lastName: string;
  city: string;
  degree: string;
  specialties: string[];
  yearsOfExperience: number;
  phoneNumber: number;
}

interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

export default function Home() {
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // Fetch advocates with search and pagination
  const fetchAdvocates = useCallback(async (search: string, page: number = 1, limit: number = 50) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      
      const response = await fetch(`/api/advocates?${params}`);
      const data = await response.json();
      
      setAdvocates(data.data || []);
      setPagination(data.pagination || null);
    } catch (error) {
      console.error("Failed to fetch advocates:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load - only run once on mount
  useEffect(() => {
    fetchAdvocates("", 1, 50);
  }, []); // Empty dependency array - only run on mount

  // Debounced search handler
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Set new timer for debounced search
    const newTimer = setTimeout(() => {
      fetchAdvocates(value, 1, pagination?.limit || 50);
    }, 300);

    setDebounceTimer(newTimer);
  };

  const handleReset = () => {
    setSearchTerm("");
    fetchAdvocates("", 1, pagination?.limit || 50);
  };

  const handlePageChange = (newPage: number) => {
    fetchAdvocates(searchTerm, newPage, pagination?.limit || 50);
  };

  return (
    <main style={{ margin: "24px" }}>
      <h1>Solace Advocates</h1>
      <br />
      <br />
      <div>
        <p>Search</p>
        <p>
          {searchTerm ? `Searching for: ${searchTerm}` : "Enter a search term"}
          {loading && " (Loading...)"}
        </p>
        <input 
          style={{ border: "1px solid black", padding: "4px" }} 
          onChange={handleSearch}
          value={searchTerm}
          placeholder="Search advocates..."
        />
        <button onClick={handleReset} style={{ marginLeft: "8px" }}>Reset Search</button>
      </div>
      
      <div style={{ marginTop: "16px" }}>
        <p>
          Showing {advocates.length} of {pagination?.totalCount || 0} advocates
          {pagination && pagination.totalPages > 1 && ` (Page ${pagination.page} of ${pagination.totalPages})`}
        </p>
      </div>

      {loading ? (
        <p>Loading advocates...</p>
      ) : advocates.length === 0 ? (
        <p>No advocates found. Try a different search term.</p>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>City</th>
                <th>Degree</th>
                <th>Specialties</th>
                <th>Years of Experience</th>
                <th>Phone Number</th>
              </tr>
            </thead>
            <tbody>
              {advocates.map((advocate: any) => {
                // Handle both camelCase and snake_case from API
                const firstName = advocate.firstName || advocate.first_name;
                const lastName = advocate.lastName || advocate.last_name;
                const city = advocate.city;
                const degree = advocate.degree;
                const yearsOfExperience = advocate.yearsOfExperience || advocate.years_of_experience;
                const phoneNumber = advocate.phoneNumber || advocate.phone_number;
                const specialties = advocate.specialties || advocate.payload || [];
                
                return (
                  <tr key={advocate.id}>
                    <td>{firstName}</td>
                    <td>{lastName}</td>
                    <td>{city}</td>
                    <td>{degree}</td>
                    <td>
                      {specialties.map((specialty, index) => (
                        <div key={`${advocate.id}-specialty-${index}`}>{specialty}</div>
                      ))}
                    </td>
                    <td>{yearsOfExperience}</td>
                    <td>{phoneNumber}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {pagination && pagination.totalPages > 1 && (
            <div style={{ marginTop: "16px" }}>
              <button 
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Previous
              </button>
              <span style={{ margin: "0 16px" }}>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button 
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
