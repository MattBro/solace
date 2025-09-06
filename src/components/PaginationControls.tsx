import React from 'react';
import { Pagination } from '@/types/advocate';

interface PaginationControlsProps {
  pagination: Pagination | null;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  showLimitSelector?: boolean;
}

const limitOptions = [10, 25, 50, 100];

export function PaginationControls({ 
  pagination, 
  onPageChange,
  onLimitChange,
  showLimitSelector = true
}: PaginationControlsProps) {
  if (!pagination || pagination.totalPages <= 1) {
    return null;
  }

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLimit = parseInt(e.target.value, 10);
    if (onLimitChange) {
      onLimitChange(newLimit);
    }
  };

  const renderPageButtons = () => {
    const { page, totalPages } = pagination;
    const buttons = [];
    const maxButtons = 7;
    
    let startPage = Math.max(1, page - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);
    
    if (endPage - startPage < maxButtons - 1) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    if (startPage > 1) {
      buttons.push(
        <button
          key={1}
          onClick={() => onPageChange(1)}
          className="min-w-[40px] h-10 px-3 bg-white dark:bg-gray-800 border-2 border-gray-300 
            dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg 
            hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-500 
            dark:hover:border-blue-400 transition-all font-semibold text-sm shadow-sm"
          aria-label="Go to page 1"
        >
          1
        </button>
      );
      if (startPage > 2) {
        buttons.push(
          <span key="dots-start" className="px-2 text-gray-400 dark:text-gray-500 select-none">
            •••
          </span>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          disabled={i === page}
          className={`min-w-[40px] h-10 px-3 rounded-lg font-semibold text-sm transition-all shadow-sm
            ${i === page 
              ? 'bg-blue-500 hover:bg-blue-600 text-white cursor-default border-2 border-blue-500' 
              : 'bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-500 dark:hover:border-blue-400'
          }`}
          aria-label={`Go to page ${i}`}
          aria-current={i === page ? 'page' : undefined}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(
          <span key="dots-end" className="px-2 text-gray-400 dark:text-gray-500 select-none">
            •••
          </span>
        );
      }
      buttons.push(
        <button
          key={totalPages}
          onClick={() => onPageChange(totalPages)}
          className="min-w-[40px] h-10 px-3 bg-white dark:bg-gray-800 border-2 border-gray-300 
            dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg 
            hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-500 
            dark:hover:border-blue-400 transition-all font-semibold text-sm shadow-sm"
          aria-label={`Go to page ${totalPages}`}
        >
          {totalPages}
        </button>
      );
    }

    return buttons;
  };

  return (
    <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 
      dark:border-gray-700 shadow-sm">
      <div className="flex flex-wrap items-center gap-4 justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="flex items-center gap-2 px-4 h-10 bg-white dark:bg-gray-800 
              border-2 border-gray-300 dark:border-gray-600 rounded-lg font-semibold text-sm 
              text-gray-900 dark:text-gray-100 hover:bg-blue-50 dark:hover:bg-blue-900/20 
              disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm
              hover:border-blue-500 dark:hover:border-blue-400"
            aria-label="Go to previous page"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>
          
          <div className="flex items-center gap-1">
            {renderPageButtons()}
          </div>
          
          <button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className="flex items-center gap-2 px-4 h-10 bg-white dark:bg-gray-800 
              border-2 border-gray-300 dark:border-gray-600 rounded-lg font-semibold text-sm 
              text-gray-900 dark:text-gray-100 hover:bg-blue-50 dark:hover:bg-blue-900/20 
              disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm
              hover:border-blue-500 dark:hover:border-blue-400"
            aria-label="Go to next page"
          >
            Next
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Page <span className="font-semibold text-gray-900 dark:text-gray-100">
              {pagination.page}
            </span> of <span className="font-semibold text-gray-900 dark:text-gray-100">
              {pagination.totalPages}
            </span>
          </span>
          {showLimitSelector && onLimitChange && (
            <>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
              <label htmlFor="limit-selector" className="flex items-center gap-2">
                <span className="text-gray-600 dark:text-gray-400">Show:</span>
                <select
                  id="limit-selector"
                  value={pagination.limit}
                  onChange={handleLimitChange}
                  className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 
                    rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                    focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                    hover:border-blue-400 dark:hover:border-blue-500 transition-all cursor-pointer"
                  aria-label="Number of items per page"
                >
                  {limitOptions.map(limit => (
                    <option key={limit} value={limit}>
                      {limit}
                    </option>
                  ))}
                </select>
              </label>
            </>
          )}
          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
          <span className="text-gray-600 dark:text-gray-400">
            Total: <span className="font-semibold text-gray-900 dark:text-gray-100">
              {pagination.totalCount.toLocaleString()}
            </span> items
          </span>
        </div>
      </div>
    </div>
  );
}