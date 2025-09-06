'use client';

import React, { useState, useRef, useEffect } from 'react';

//todo: load these from the backend
const SPECIALTIES = [
  "Bipolar",
  "LGBTQ",
  "Medication/Prescribing",
  "Suicide History/Attempts",
  "General Mental Health",
  "Men's issues",
  "Relationship Issues",
  "Trauma & PTSD",
  "Personality disorders",
  "Personal growth",
  "Substance use/abuse",
  "Pediatrics",
  "Women's issues",
  "Chronic pain",
  "Weight loss & nutrition",
  "Eating disorders",
  "Diabetic Diet and nutrition",
  "Coaching",
  "Life coaching",
  "Obsessive-compulsive disorders",
  "Neuropsychological evaluations",
  "ADHD",
  "Sleep issues",
  "Schizophrenia",
  "Learning disorders",
  "Domestic abuse",
];

interface SpecialtyFilterProps {
  selectedSpecialties: string[];
  onChange: (specialties: string[]) => void;
  loading?: boolean;
}

export function SpecialtyFilter({ selectedSpecialties, onChange, loading = false }: SpecialtyFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggleSpecialty = (specialty: string) => {
    if (selectedSpecialties.includes(specialty)) {
      onChange(selectedSpecialties.filter(s => s !== specialty));
    } else {
      onChange([...selectedSpecialties, specialty]);
    }
  };

  const handleClearAll = () => {
    onChange([]);
    setIsOpen(false);
  };

  const handleSelectAll = () => {
    onChange(SPECIALTIES);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 dark:bg-gray-800 
          border-2 border-gray-300 dark:border-gray-600 rounded-lg text-sm
          hover:border-blue-500 dark:hover:border-blue-400 focus:outline-none 
          focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 
          focus:ring-blue-100 dark:focus:ring-blue-900 transition-all
          disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px] shadow-sm"
      >
        <svg 
          className="w-4 h-4 text-gray-800 dark:text-gray-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        <span className="flex-1 text-left text-black dark:text-gray-100 font-bold">
          {selectedSpecialties.length === 0 
            ? 'Filter by Specialty' 
            : `${selectedSpecialties.length} selected`}
        </span>
        <svg 
          className={`w-4 h-4 text-gray-800 dark:text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-80 bg-white dark:bg-gray-800 
          border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                Select Specialties
              </span>
              <div className="flex gap-2">
                <span
                  onClick={handleSelectAll}
                  className="text-xs text-blue-700 dark:text-blue-400 hover:underline font-medium cursor-pointer"
                >
                  Select All
                </span>
                <span
                  onClick={handleClearAll}
                  className="text-xs text-gray-700 dark:text-gray-400 hover:underline font-medium cursor-pointer"
                >
                  Clear
                </span>
              </div>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
              {selectedSpecialties.length} of {SPECIALTIES.length} selected
            </div>
          </div>
          
          <div className="max-h-80 overflow-y-auto p-2">
            {SPECIALTIES.map(specialty => (
              <label
                key={specialty}
                className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer
                  hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedSpecialties.includes(specialty)}
                  onChange={() => handleToggleSpecialty(specialty)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded 
                    focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-sm text-gray-800 dark:text-gray-200 font-medium">
                  {specialty}
                </span>
              </label>
            ))}
          </div>

          {selectedSpecialties.length > 0 && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 
                  dark:hover:bg-blue-600 text-white font-semibold text-sm 
                  rounded-lg transition-colors shadow-sm"
              >
                Apply Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}