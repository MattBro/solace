"use client";

import { useAdvocates } from '@/hooks/useAdvocates';
import { SearchInput } from '@/components/SearchInput';
import { SpecialtyFilter } from '@/components/SpecialtyFilter';
import { AdvocateTable } from '@/components/AdvocateTable';
import { PaginationControls } from '@/components/PaginationControls';
import { DarkModeToggle } from '@/components/DarkModeToggle';

export default function Home() {
  const {
    advocates,
    loading,
    error,
    searchTerm,
    selectedSpecialties,
    pagination,
    setSearchTerm,
    setSelectedSpecialties,
    handlePageChange,
    handleLimitChange,
    refresh,
  } = useAdvocates(50);

  return (
    <main className="min-h-screen p-6 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950">
      <header className="flex justify-between items-center mb-8 pb-6 border-b-2 border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <svg 
            width="48" 
            height="48" 
            viewBox="0 0 48 48" 
            fill="none"
            className="flex-shrink-0"
          >
            <circle cx="24" cy="24" r="22" className="fill-blue-100 dark:fill-blue-900/30"/>
            <circle cx="24" cy="24" r="16" className="fill-blue-200 dark:fill-blue-800/50"/>
            <circle cx="24" cy="24" r="10" className="fill-blue-500 dark:fill-blue-400"/>
            <path d="M24 14 L24 34 M14 24 L34 24" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Solace Health
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mt-1">
              Expert Healthcare Advocacy Network
            </p>
          </div>
        </div>
        <DarkModeToggle />
      </header>
      
      <SearchInput
        value={searchTerm}
        onChange={setSearchTerm}
        onReset={refresh}
        loading={loading}
      />
      
      <div className="mt-4 mb-4 flex justify-between items-center">
        <SpecialtyFilter
          selectedSpecialties={selectedSpecialties}
          onChange={setSelectedSpecialties}
          loading={loading}
        />
        <p className="text-gray-600 dark:text-gray-400">
          Showing {advocates.length} of {pagination?.totalCount || 0} advocates
          {pagination && pagination.totalPages > 1 && ` (Page ${pagination.page} of ${pagination.totalPages})`}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 
          rounded-lg p-4 mb-4">
          <p className="text-red-600 dark:text-red-400">Error: {error}</p>
          <button 
            onClick={refresh}
            className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded 
              font-medium transition-colors"
          >
            Retry
          </button>
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