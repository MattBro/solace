'use client';

import React, { useMemo, useState } from 'react';
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

  const columns = useMemo(
    () => [
      columnHelper.accessor('firstName', {
        header: 'First Name',
        cell: info => info.getValue(),
        enableSorting: true,
      }),
      columnHelper.accessor('lastName', {
        header: 'Last Name',
        cell: info => info.getValue(),
        enableSorting: true,
      }),
      columnHelper.accessor('city', {
        header: 'City',
        cell: info => info.getValue(),
        enableSorting: true,
      }),
      columnHelper.accessor('degree', {
        header: 'Degree',
        cell: info => info.getValue(),
        enableSorting: true,
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
      }),
      columnHelper.accessor('phoneNumber', {
        header: 'Phone Number',
        cell: info => info.getValue(),
        enableSorting: false,
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
      <div className="column-visibility-controls" style={{ marginBottom: '16px' }}>
        <details>
          <summary style={{ 
            cursor: 'pointer', 
            marginBottom: '8px',
            padding: '8px',
            backgroundColor: '#f5f5f5',
            borderRadius: '4px',
            fontWeight: 'bold'
          }}>
            Column Visibility
          </summary>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '12px', 
            padding: '12px',
            backgroundColor: '#fafafa',
            borderRadius: '4px',
            marginTop: '8px'
          }}>
            {table.getAllLeafColumns().map(column => (
              <label key={column.id} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={column.getIsVisible()}
                  onChange={column.getToggleVisibilityHandler()}
                  style={{ cursor: 'pointer' }}
                />
                <span style={{ fontSize: '14px' }}>{column.id}</span>
              </label>
            ))}
          </div>
        </details>
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
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th 
                    key={header.id}
                    style={{ 
                      padding: '12px',
                      textAlign: 'left',
                      borderBottom: '2px solid #dee2e6',
                      fontWeight: '600',
                      color: '#495057',
                      cursor: header.column.getCanSort() ? 'pointer' : 'default',
                      userSelect: 'none',
                      whiteSpace: 'nowrap',
                      transition: 'background-color 0.2s',
                      ':hover': {
                        backgroundColor: header.column.getCanSort() ? '#e9ecef' : 'transparent'
                      }
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