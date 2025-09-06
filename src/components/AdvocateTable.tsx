'use client';

import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
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
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [expandedSpecialties, setExpandedSpecialties] = useState<Set<string>>(new Set());
  const menuRef = useRef<HTMLDivElement>(null);

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
          const rowId = info.row.id;
          const isExpanded = expandedSpecialties.has(rowId);
          const MAX_DISPLAY = 2;
          
          if (specialties.length === 0) {
            return <span className="text-gray-500 dark:text-gray-400 text-xs">None</span>;
          }
          
          const displaySpecialties = isExpanded ? specialties : specialties.slice(0, MAX_DISPLAY);
          const remaining = specialties.length - MAX_DISPLAY;
          
          return (
            <div className="flex flex-wrap gap-1 items-center max-w-md">
              {displaySpecialties.map((specialty, index) => (
                <span
                  key={`${info.row.id}-specialty-${index}`}
                  title={specialty}
                  className={`inline-block px-2.5 py-1 bg-blue-50 dark:bg-blue-900/50 
                    text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700
                    rounded-full text-xs font-medium whitespace-nowrap
                    ${!isExpanded ? 'max-w-[150px] truncate' : ''}`}
                >
                  {specialty}
                </span>
              ))}
              {remaining > 0 && !isExpanded && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedSpecialties(prev => {
                      const next = new Set(prev);
                      next.add(rowId);
                      return next;
                    });
                  }}
                  className="inline-block px-2.5 py-1 bg-blue-500 hover:bg-blue-600
                    text-white rounded-full text-xs font-medium cursor-pointer 
                    transition-colors shadow-sm hover:shadow"
                >
                  +{remaining} more
                </button>
              )}
              {isExpanded && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedSpecialties(prev => {
                      const next = new Set(prev);
                      next.delete(rowId);
                      return next;
                    });
                  }}
                  className="inline-block px-2.5 py-1 bg-blue-500 hover:bg-blue-600
                    text-white rounded-full text-xs font-medium cursor-pointer 
                    transition-colors shadow-sm hover:shadow"
                >
                  Show less
                </button>
              )}
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
    [expandedSpecialties]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (loading) {
    return <p className="text-gray-500 dark:text-gray-400 p-5 text-center">Loading advocates...</p>;
  }

  if (data.length === 0) {
    return <p className="text-gray-500 dark:text-gray-400 p-5 text-center">No advocates found. Try a different search term.</p>;
  }

  return (
    <div className="mt-5">
      <div className="mb-4 flex justify-end items-center relative" ref={menuRef}>
        <button
          onClick={() => setShowColumnMenu(!showColumnMenu)}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-500 hover:bg-blue-600
            text-white rounded-lg cursor-pointer text-sm 
            font-medium transition-colors shadow-sm hover:shadow"
        >
          <span>⚙</span>
          Columns
          <span className="text-xs">{showColumnMenu ? '▲' : '▼'}</span>
        </button>
        
        {showColumnMenu && (
          <div className="absolute top-full right-0 mt-1 bg-white dark:bg-gray-800 
            border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 min-w-[200px]">
            <div className="p-2 border-b border-gray-200 dark:border-gray-700">
              <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded 
                hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={table.getIsAllColumnsVisible()}
                  onChange={table.getToggleAllColumnsVisibilityHandler()}
                  className="cursor-pointer"
                />
                Show All
              </label>
            </div>
            <div className="max-h-[300px] overflow-y-auto p-2">
              {table.getAllLeafColumns().map(column => (
                <label
                  key={column.id}
                  className="flex items-center gap-2 cursor-pointer p-1.5 rounded 
                    hover:bg-gray-100 dark:hover:bg-gray-700 text-sm transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={column.getIsVisible()}
                    onChange={column.getToggleVisibilityHandler()}
                    className="cursor-pointer"
                  />
                  <span>{column.id}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg shadow">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            {table.getHeaderGroups().map(headerGroup => (
              <React.Fragment key={headerGroup.id}>
                <tr>
                  {headerGroup.headers.map(header => (
                    <th 
                      key={header.id}
                      className={`p-3 text-left border-b border-gray-200 dark:border-gray-700 
                        font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap
                        ${header.column.getCanSort() ? 'cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700' : ''}`}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {header.isPlaceholder ? null : (
                        <div className="flex items-center gap-1">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getCanSort() && (
                            <span className="text-gray-500 dark:text-gray-400">
                              {header.column.getIsSorted() === 'asc' ? ' ↑' : 
                               header.column.getIsSorted() === 'desc' ? ' ↓' : ' ↕'}
                            </span>
                          )}
                        </div>
                      )}
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
                className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'} 
                  hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors`}
              >
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="p-3 border-b border-gray-200 dark:border-gray-700 
                    text-gray-900 dark:text-gray-100 align-top">
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