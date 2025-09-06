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
          style={{ margin: '0 2px' }}
          aria-label="Go to page 1"
        >
          1
        </button>
      );
      if (startPage > 2) {
        buttons.push(<span key="dots-start" style={{ margin: '0 4px' }}>...</span>);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          disabled={i === page}
          style={{ 
            margin: '0 2px',
            fontWeight: i === page ? 'bold' : 'normal',
            textDecoration: i === page ? 'underline' : 'none'
          }}
          aria-label={`Go to page ${i}`}
          aria-current={i === page ? 'page' : undefined}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(<span key="dots-end" style={{ margin: '0 4px' }}>...</span>);
      }
      buttons.push(
        <button
          key={totalPages}
          onClick={() => onPageChange(totalPages)}
          style={{ margin: '0 2px' }}
          aria-label={`Go to page ${totalPages}`}
        >
          {totalPages}
        </button>
      );
    }

    return buttons;
  };

  return (
    <div className="pagination-controls" style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div className="pagination-buttons" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={() => onPageChange(pagination.page - 1)}
          disabled={pagination.page === 1}
          aria-label="Go to previous page"
        >
          Previous
        </button>
        
        <div className="page-numbers" style={{ display: 'flex', alignItems: 'center' }}>
          {renderPageButtons()}
        </div>
        
        <button
          onClick={() => onPageChange(pagination.page + 1)}
          disabled={pagination.page === pagination.totalPages}
          aria-label="Go to next page"
        >
          Next
        </button>
      </div>

      <div className="pagination-info" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>
          Page {pagination.page} of {pagination.totalPages}
        </span>
        {showLimitSelector && onLimitChange && (
          <>
            <span>|</span>
            <label htmlFor="limit-selector">
              Show:
              <select
                id="limit-selector"
                value={pagination.limit}
                onChange={handleLimitChange}
                style={{ marginLeft: '4px' }}
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
        <span>| Total: {pagination.totalCount} items</span>
      </div>
    </div>
  );
}