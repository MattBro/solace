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
  placeholder = "Search advocates..."
}: SearchInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleReset = () => {
    onChange("");
    onReset();
  };

  return (
    <div className="search-container">
      <label htmlFor="search-input">
        <p>Search</p>
        <p className="search-status">
          {value ? `Searching for: ${value}` : "Enter a search term"}
          {loading && " (Loading...)"}
        </p>
      </label>
      <div className="search-controls">
        <input
          id="search-input"
          type="text"
          className="search-input"
          onChange={handleChange}
          value={value}
          placeholder={placeholder}
          aria-label="Search advocates"
        />
        <button 
          onClick={handleReset} 
          className="secondary"
          disabled={!value && !loading}
          aria-label="Reset search"
        >
          Reset Search
        </button>
      </div>
    </div>
  );
}