import { useState, useEffect } from 'react';

export function useSessionStorage(key, initialValue) {
  // Initialize the state
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading sessionStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Sync state to sessionStorage whenever it changes.
  // By returning the native setStoredValue, we ensure functional updates
  // (e.g. setForm(prev => ...)) work perfectly with React's update queue.
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(key, JSON.stringify(storedValue));
      }
    } catch (error) {
      console.warn(`Error setting sessionStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
