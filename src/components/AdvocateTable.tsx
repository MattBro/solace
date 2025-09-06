'use client';

import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
} from '@tanstack/react-table';
import { Advocate } from '@/types/advocate';

interface AdvocateTableProps {
  data: Advocate[];
  loading?: boolean;
}

const columnHelper = createColumnHelper<Advocate>();

export function AdvocateTable({ data, loading = false }: AdvocateTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowColumnMenu(false);
      }
    };

    if (showColumnMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showColumnMenu]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('firstName', {
        header: 'First Name',
        cell: info => info.getValue(),
        enableSorting: true,
        filterFn: 'includesString',
      }),
      columnHelper.accessor('lastName', {
        header: 'Last Name',
        cell: info => info.getValue(),
        enableSorting: true,
        filterFn: 'includesString',
      }),
      columnHelper.accessor('city', {
        header: 'City',
        cell: info => info.getValue(),
        enableSorting: true,
        filterFn: 'includesString',
      }),
      columnHelper.accessor('degree', {
        header: 'Degree',
        cell: info => info.getValue(),
        enableSorting: true,
        filterFn: 'includesString',
      }),
      columnHelper.accessor('specialties', {
        header: 'Specialties',
        cell: info => {
          const specialties = info.getValue();
          return (
            <div className="specialties-cell">
              {specialties.map((specialty, index) => (
                <div key={`${info.row.id}-specialty-${index}`}>{specialty}</div>
              ))}
            </div>
          );
        },
        enableSorting: false,
      }),
      columnHelper.accessor('yearsOfExperience', {
        header: 'Years of Experience',
        cell: info => info.getValue(),
        enableSorting: true,
        filterFn: 'inNumberRange',
      }),
      columnHelper.accessor('phoneNumber', {
        header: 'Phone Number',
        cell: info => info.getValue(),
        enableSorting: false,
        filterFn: 'includesString',
      }),
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (loading) {
    return <p>Loading advocates...</p>;
  }

  if (data.length === 0) {
    return <p>No advocates found. Try a different search term.</p>;
  }

  return (
    <div className="table-container" style={{ marginTop: '20px' }}>
      <div className="table-controls" ref={menuRef} style={{ 
        marginBottom: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {columnFilters.length > 0 && (
            <button
              onClick={() => setColumnFilters([])}
              style={{
                padding: '8px 16px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              Clear Filters ({columnFilters.length})
            </button>
          )}
        </div>
        <button
          onClick={() => setShowColumnMenu(!showColumnMenu)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            backgroundColor: 'white',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s',
            color: '#495057'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f8f9fa';
            e.currentTarget.style.borderColor = '#adb5bd';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'white';
            e.currentTarget.style.borderColor = '#dee2e6';
          }}
        >
          <span>⚙</span>
          Columns
          <span style={{ fontSize: '12px' }}>{showColumnMenu ? '▲' : '▼'}</span>
        </button>
        
        {showColumnMenu && (
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '4px',
            backgroundColor: 'white',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            zIndex: 1000,
            minWidth: '200px'
          }}>
            <div style={{
              padding: '8px',
              borderBottom: '1px solid #dee2e6'
            }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '14px'
              }}>
                <input
                  type="checkbox"
                  checked={table.getIsAllColumnsVisible()}
                  onChange={table.getToggleAllColumnsVisibilityHandler()}
                  style={{ cursor: 'pointer' }}
                />
                Show All
              </label>
            </div>
            <div style={{
              maxHeight: '300px',
              overflowY: 'auto',
              padding: '8px'
            }}>
              {table.getAllLeafColumns().map(column => (
                <label
                  key={column.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    padding: '6px 8px',
                    borderRadius: '4px',
                    fontSize: '14px',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <input
                    type="checkbox"
                    checked={column.getIsVisible()}
                    onChange={column.getToggleVisibilityHandler()}
                    style={{ cursor: 'pointer' }}
                  />
                  <span>{column.id}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ 
        overflowX: 'auto',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '14px'
        }}>
          <thead style={{ backgroundColor: '#f8f9fa' }}>
            {table.getHeaderGroups().map(headerGroup => (
              <React.Fragment key={headerGroup.id}>
                <tr>
                  {headerGroup.headers.map(header => (
                    <th 
                      key={header.id}
                      style={{ 
                        padding: '12px',
                        textAlign: 'left',
                        borderBottom: '1px solid #dee2e6',
                        fontWeight: '600',
                        color: '#495057',
                        cursor: header.column.getCanSort() ? 'pointer' : 'default',
                        userSelect: 'none',
                        whiteSpace: 'nowrap',
                        transition: 'background-color 0.2s'
                      }}
                      onClick={header.column.getToggleSortingHandler()}
                      onMouseEnter={(e) => {
                        if (header.column.getCanSort()) {
                          e.currentTarget.style.backgroundColor = '#e9ecef';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      {header.isPlaceholder ? null : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getCanSort() && (
                            <span style={{ color: '#6c757d' }}>
                              {header.column.getIsSorted() === 'asc' ? ' ↑' : 
                               header.column.getIsSorted() === 'desc' ? ' ↓' : ' ↕'}
                            </span>
                          )}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
                <tr>
                  {headerGroup.headers.map(header => (
                    <th
                      key={`${header.id}-filter`}
                      style={{
                        padding: '4px 12px 8px',
                        borderBottom: '2px solid #dee2e6',
                      }}
                    >
                      {header.column.getCanFilter() ? (
                        <input
                          type="text"
                          value={(header.column.getFilterValue() ?? '') as string}
                          onChange={e => header.column.setFilterValue(e.target.value)}
                          placeholder={`Filter ${header.column.id}...`}
                          style={{
                            width: '100%',
                            padding: '4px 8px',
                            fontSize: '13px',
                            border: '1px solid #ced4da',
                            borderRadius: '3px',
                            backgroundColor: 'white',
                          }}
                          onClick={e => e.stopPropagation()}
                        />
                      ) : null}
                    </th>
                  ))}
                </tr>
              </React.Fragment>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, index) => (
              <tr 
                key={row.id}
                style={{
                  backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e7f1ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'white' : '#f8f9fa';
                }}
              >
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} style={{
                    padding: '12px',
                    borderBottom: '1px solid #dee2e6',
                    color: '#212529',
                    verticalAlign: 'top'
                  }}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}