'use client';

import { useRef, useState } from 'react';
import { X, Plus, UserRound } from 'lucide-react';
import { useCustomers } from '@/hooks/use-customers';
import { useDebounce } from '@/hooks/use-debounce';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Customer } from '@/types/customer';

const CUSTOMER_SEARCH_LIMIT = 10;
const SEARCH_DEBOUNCE_MS = 300;

interface CustomerSearchSelectProps {
  value: Customer | null;
  onChange: (customer: Customer | null) => void;
  onCreateClick: () => void;
}

export function CustomerSearchSelect({ value, onChange, onCreateClick }: CustomerSearchSelectProps) {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const debouncedSearch = useDebounce(inputValue, SEARCH_DEBOUNCE_MS);

  const { data, isLoading } = useCustomers({
    search: debouncedSearch || undefined,
    limit: CUSTOMER_SEARCH_LIMIT,
  });
  const customers = data?.data ?? [];

  const handleSelect = (customer: Customer) => {
    onChange(customer);
    setInputValue('');
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange(null);
    setInputValue('');
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setIsOpen(true);
  };

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!containerRef.current?.contains(e.relatedTarget)) {
      setIsOpen(false);
    }
  };

  if (value) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--accent)/0.4)] px-3 py-2">
        <UserRound className="h-4 w-4 shrink-0 text-[hsl(var(--muted-foreground))]" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{value.fullName}</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">{value.phone}</p>
        </div>
        <button
          type="button"
          onClick={handleClear}
          className="shrink-0 rounded-sm p-0.5 hover:bg-[hsl(var(--accent))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative flex gap-2" onBlur={handleBlur}>
      <div className="relative flex-1">
        <Input
          placeholder="Search by name or phone..."
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          autoComplete="off"
        />
        {isOpen && (
          <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-52 overflow-y-auto rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] shadow-md">
            {isLoading ? (
              <div className="px-3 py-4 text-center text-sm text-[hsl(var(--muted-foreground))]">
                Searching...
              </div>
            ) : customers.length === 0 ? (
              <div className="px-3 py-4 text-center text-sm text-[hsl(var(--muted-foreground))]">
                {debouncedSearch ? 'No customers found.' : 'Type to search customers.'}
              </div>
            ) : (
              customers.map((customer) => (
                <button
                  key={customer.id}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(customer)}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-[hsl(var(--accent))] border-b border-[hsl(var(--border))] last:border-0"
                >
                  <UserRound className="h-4 w-4 shrink-0 text-[hsl(var(--muted-foreground))]" />
                  <span className="flex-1 font-medium">{customer.fullName}</span>
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">{customer.phone}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>
      <Button type="button" variant="outline" size="sm" onClick={onCreateClick} title="Create new customer" className="shrink-0 px-3">
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
