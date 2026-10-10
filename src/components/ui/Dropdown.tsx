import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import { DropdownOption } from '../../types';

interface DropdownProps {
  value: string | number;
  options: DropdownOption[];
  onChange: (value: string) => void;
  width?: string;
  variant?: 'pill' | 'square';
  maxVisibleOptions?: number;
}

export default function Dropdown({
  value, options, onChange, width = "w-32", variant = 'pill', maxVisibleOptions = 5
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // useMemo ensures that if the language changes and the labels update, 
  // the trigger button updates instantly without unnecessary re-renders.
  const selectedLabel = useMemo(() => {
    return options.find(o => String(o.value) === String(value))?.label || String(value);
  }, [options, value]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      e.preventDefault();
      setIsOpen(true);
      // Set initial highlight to current selected value or first item
      const currentIndex = options.findIndex(o => String(o.value) === String(value));
      setHighlightedIndex(currentIndex >= 0 ? currentIndex : 0);
      return;
    }

    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => (prev + 1) % options.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev - 1 + options.length) % options.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < options.length) {
          onChange(String(options[highlightedIndex].value));
          setIsOpen(false);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  // Auto-scroll to highlighted option
  useEffect(() => {
    if (!isOpen || highlightedIndex < 0) return;
    const optionEl = optionsRef.current?.children[highlightedIndex] as HTMLElement;
    if (optionEl) {
      optionEl.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex, isOpen]);

  const maxMenuHeight = `${maxVisibleOptions * 40}px`;

  const triggerClasses = variant === 'pill'
    ? `w-full bg-white rounded-full text-xs font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 focus:outline-none cursor-pointer flex items-center justify-between transition pl-4 pr-3 py-2 ${isOpen ? 'border-[#ff682c]' : ''}`
    : `w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 focus:outline-none cursor-pointer flex items-center justify-between transition ${isOpen ? 'border-[#ff682c]' : ''}`;

  return (
    <div ref={dropdownRef} className={`relative ${width}`}>
      <button 
        type="button" 
        onClick={() => setIsOpen(!isOpen)} 
        onKeyDown={handleKeyDown}
        className={triggerClasses}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate" dir="auto">{selectedLabel}</span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div 
            className={`absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 ${variant === 'pill' ? 'rounded-2xl' : 'rounded-lg'} shadow-lg z-50 overflow-hidden`}
            role="listbox"
          >
            <div ref={optionsRef} className="overflow-y-auto py-1" style={{ maxHeight: maxMenuHeight }}>
              {options.map((option, index) => {
                const isSelected = String(option.value) === String(value);
                const isHighlighted = index === highlightedIndex;
                
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(String(option.value));
                      setIsOpen(false);
                    }}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`w-full text-left px-4 py-2.5 text-xs font-medium transition cursor-pointer ${
                      isSelected 
                        ? 'bg-[#ffedeb] text-[#ff682c] font-bold' 
                        : isHighlighted 
                          ? 'bg-slate-50 text-slate-700' 
                          : 'text-slate-700'
                    }`}
                    role="option"
                    aria-selected={isSelected}
                    dir="auto"
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}