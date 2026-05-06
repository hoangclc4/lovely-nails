import { useState } from 'react';
import type { ColumnSizingState, OnChangeFn } from '@tanstack/react-table';

export function useColumnSizing(storageKey: string): [ColumnSizingState, OnChangeFn<ColumnSizingState>] {
  const [sizing, setSizing] = useState<ColumnSizingState>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? (JSON.parse(stored) as ColumnSizingState) : {};
    } catch {
      return {};
    }
  });

  const handleChange: OnChangeFn<ColumnSizingState> = (updater) => {
    setSizing((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // ignore storage errors (e.g. private mode quota)
      }
      return next;
    });
  };

  return [sizing, handleChange];
}
