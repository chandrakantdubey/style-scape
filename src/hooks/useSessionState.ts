import { useState } from "react";

export function useSessionState<T>(key: string, initialValue: T) {
  return useState<T>(() => {
    try {
      const storedValue = window.sessionStorage.getItem(key);
      return storedValue ? (JSON.parse(storedValue) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });
}

export function saveSessionState<T>(key: string, value: T) {
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Session persistence is a convenience, not a critical path.
  }
}

