// hooks/usePersistedState.ts
"use client";

import { useState, useEffect } from "react";

export function usePersistedState<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [state, setState] = useState<T>(initialValue);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem(key);
    if (saved !== null) {
      try {
        setState(JSON.parse(saved));
      } catch (e) {
        console.error("Error parsing localStorage value:", e);
      }
    }
  }, [key]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(key, JSON.stringify(state));
    }
  }, [key, state, isMounted]);

  return [state, setState];
}