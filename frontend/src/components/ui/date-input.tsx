'use client';

import { useState } from 'react';
import { CalendarIcon } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function toDisplayDate(iso: string): string {
  if (!iso || !ISO_DATE_PATTERN.test(iso)) return '';
  const [y, m, d] = iso.split('-');
  return `${d}-${m}-${y}`;
}

function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function fromIsoDate(iso: string): Date | undefined {
  if (!iso || !ISO_DATE_PATTERN.test(iso)) return undefined;
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  id?: string;
  disabled?: boolean;
  min?: string;
}

export function DateInput({ value, onChange, className, id, disabled, min }: DateInputProps) {
  const [open, setOpen] = useState(false);
  const selected = fromIsoDate(value);
  const fromDate = min ? fromIsoDate(min) : undefined;

  function handleSelect(date: Date | undefined) {
    onChange(date ? toIsoDate(date) : '');
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          disabled={disabled}
          className={cn(
            'flex h-9 w-full items-center gap-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]',
            !value && 'text-[hsl(var(--muted-foreground))]',
            disabled && 'cursor-not-allowed opacity-50',
            className,
          )}
        >
          <CalendarIcon className="h-4 w-4 shrink-0 opacity-50" />
          {value ? toDisplayDate(value) : 'dd-mm-yyyy'}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <DayPicker
          mode="single"
          selected={selected}
          onSelect={handleSelect}
          disabled={fromDate ? { before: fromDate } : undefined}
          defaultMonth={selected ?? fromDate}
          classNames={{
            root: 'p-3',
            months: 'flex flex-col',
            month: 'flex flex-col gap-4',
            month_caption: 'relative flex items-center justify-center pt-1',
            caption_label: 'text-sm font-medium',
            nav: 'flex items-center gap-1',
            button_previous:
              'absolute left-1 flex h-7 w-7 items-center justify-center rounded-md opacity-50 hover:bg-[hsl(var(--accent))] hover:opacity-100',
            button_next:
              'absolute right-1 flex h-7 w-7 items-center justify-center rounded-md opacity-50 hover:bg-[hsl(var(--accent))] hover:opacity-100',
            month_grid: 'w-full border-collapse',
            weekdays: 'flex',
            weekday:
              'w-8 rounded-md text-center text-[0.8rem] font-normal text-[hsl(var(--muted-foreground))]',
            week: 'mt-2 flex w-full',
            day: 'relative p-0 text-center text-sm',
            day_button:
              'h-8 w-8 rounded-md p-0 font-normal transition-colors hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]',
            selected:
              '[&>button]:bg-[hsl(var(--primary))] [&>button]:text-[hsl(var(--primary-foreground))] [&>button]:hover:bg-[hsl(var(--primary))]',
            today: '[&>button]:font-semibold [&>button]:underline',
            outside: 'opacity-40',
            disabled: 'opacity-25',
            hidden: 'invisible',
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
