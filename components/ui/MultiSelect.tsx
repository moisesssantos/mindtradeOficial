
import React, { useState, useRef, useEffect } from 'react';
import { BaseItem } from '../../types';
import { X, ChevronDown } from 'lucide-react';

interface MultiSelectProps {
  options: BaseItem[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({ options, selected, onChange, placeholder = "Selecione..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSelect = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter(item => item !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  const getOptionName = (id: string) => options.find(opt => opt.id === id)?.nome || '';

  return (
    <div className="relative" ref={containerRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      >
        <div className="flex flex-wrap gap-2">
          {selected.length > 0 ? (
            selected.map(id => (
              <span key={id} className="flex items-center gap-1 bg-indigo-100 text-indigo-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {getOptionName(id)}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(id);
                  }}
                  className="flex-shrink-0 -mr-1 ml-1 h-4 w-4 rounded-full inline-flex items-center justify-center text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:outline-none focus:bg-indigo-500 focus:text-white"
                >
                  <X size={12} />
                </button>
              </span>
            ))
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </div>
        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <ChevronDown className="h-5 w-5 text-gray-400" />
        </span>
      </div>
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {options.map(option => (
            <div
              key={option.id}
              onClick={() => handleSelect(option.id)}
              className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-100"
            >
              <span className={`font-normal block truncate ${selected.includes(option.id) ? 'font-semibold' : ''}`}>
                {option.nome}
              </span>
              {selected.includes(option.id) && (
                <span className="text-indigo-600 absolute inset-y-0 right-0 flex items-center pr-4">
                  ✓
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
