import React from 'react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onReset: () => void;
  loading?: boolean;
  placeholder?: string;
}

export function SearchInput({ 
  value, 
  onChange, 
  onReset, 
  loading = false,
  placeholder = "Search for patient advocates by name, city, or specialty..."
}: SearchInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleReset = () => {
    onChange("");
    onReset();
  };

  return (
    <div className="bg-white dark:bg-gray-800 
      p-6 rounded-xl border border-gray-200 dark:border-gray-700 mb-6 shadow-sm">
      <label htmlFor="search-input">
        <p className="text-lg font-semibold mb-1 text-gray-900 dark:text-gray-100">
          Find Your Healthcare Advocate
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {value ? `Searching for: "${value}"` : "Search by name, location, degree, or specialty"}
          {loading && " (Loading...)"}
        </p>
      </label>
      <div className="flex gap-3">
        <div className="relative flex-1">
          <input
            id="search-input"
            type="text"
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 dark:border-gray-600 
              rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
              placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none 
              focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 
              focus:ring-blue-100 dark:focus:ring-blue-900 transition-all text-base"
            onChange={handleChange}
            value={value}
            placeholder={placeholder}
            aria-label="Search advocates"
          />
          <svg 
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
        </div>
        <button 
          onClick={handleReset} 
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white 
            rounded-lg font-semibold disabled:opacity-50 
            disabled:cursor-not-allowed transition-all min-w-[140px] shadow-sm hover:shadow"
          disabled={!value && !loading}
          aria-label="Reset search"
        >
          Clear Search
        </button>
      </div>
    </div>
  );
}