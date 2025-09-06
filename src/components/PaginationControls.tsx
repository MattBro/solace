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
          className="mx-0.5 px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Go to page 1"
        >
          1
        </button>
      );
      if (startPage > 2) {
        buttons.push(
          <span key="dots-start" className="mx-1 text-gray-500 dark:text-gray-400">
            ...
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
          className={`mx-0.5 px-3 py-1 rounded transition-colors ${
            i === page 
              ? 'bg-blue-500 text-white font-semibold cursor-default shadow-sm' 
              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
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
          <span key="dots-end" className="mx-1 text-gray-500 dark:text-gray-400">
            ...
          </span>
        );
      }
      buttons.push(
        <button
          key={totalPages}
          onClick={() => onPageChange(totalPages)}
          className="mx-0.5 px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label={`Go to page ${totalPages}`}
        >
          {totalPages}
        </button>
      );
    }

    return buttons;
  };

  return (
    <div className="mt-4 flex flex-wrap items-center gap-4 justify-between">
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(pagination.page - 1)}
          disabled={pagination.page === 1}
          className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
            rounded-lg font-medium text-sm text-gray-700 dark:text-gray-200 
            hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 
            disabled:cursor-not-allowed transition-colors"
          aria-label="Go to previous page"
        >
          Previous
        </button>
        
        <div className="flex items-center">
          {renderPageButtons()}
        </div>
        
        <button
          onClick={() => onPageChange(pagination.page + 1)}
          disabled={pagination.page === pagination.totalPages}
          className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
            rounded-lg font-medium text-sm text-gray-700 dark:text-gray-200 
            hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 
            disabled:cursor-not-allowed transition-colors"
          aria-label="Go to next page"
        >
          Next
        </button>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <span>
          Page {pagination.page} of {pagination.totalPages}
        </span>
        {showLimitSelector && onLimitChange && (
          <>
            <span className="text-gray-400 dark:text-gray-600">|</span>
            <label htmlFor="limit-selector" className="flex items-center gap-1">
              Show:
              <select
                id="limit-selector"
                value={pagination.limit}
                onChange={handleLimitChange}
                className="ml-1 px-2 py-1 border border-gray-300 dark:border-gray-600 
                  rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                  focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
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
        <span className="text-gray-400 dark:text-gray-600">|</span>
        <span>Total: {pagination.totalCount} items</span>
      </div>
    </div>
  );
}