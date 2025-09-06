"use client";

import { useAdvocates } from '@/hooks/useAdvocates';
import { SearchInput } from '@/components/SearchInput';
import { AdvocateTable } from '@/components/AdvocateTable';
import { PaginationControls } from '@/components/PaginationControls';

export default function Home() {
  const {
    advocates,
    loading,
    error,
    searchTerm,
    pagination,
    setSearchTerm,
    handlePageChange,
    handleLimitChange,
    refresh,
  } = useAdvocates(50);

  return (
    <main style={{ margin: "24px" }}>
      <h1>Solace Advocates</h1>
      <br />
      <br />
      
      <SearchInput
        value={searchTerm}
        onChange={setSearchTerm}
        onReset={refresh}
        loading={loading}
      />
      
      <div style={{ marginTop: "16px" }}>
        <p>
          Showing {advocates.length} of {pagination?.totalCount || 0} advocates
          {pagination && pagination.totalPages > 1 && ` (Page ${pagination.page} of ${pagination.totalPages})`}
        </p>
      </div>

      {error && (
        <div style={{ color: 'red', marginTop: '16px' }}>
          <p>Error: {error}</p>
          <button onClick={refresh}>Retry</button>
        </div>
      )}

      <AdvocateTable 
        data={advocates}
        loading={loading}
      />
      
      <PaginationControls
        pagination={pagination}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        showLimitSelector={true}
      />
    </main>
  );
}