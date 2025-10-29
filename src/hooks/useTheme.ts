import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark';

const getInitialTheme = (): Theme => {
    // This function is safe to run on the client side and ensures
    // we get the correct theme before the first render.
    if (typeof window === 'undefined') {
        return 'light';
    }
    try {
        const storedTheme = window.localStorage.getItem('theme') as Theme | null;
        if (storedTheme) {
            return storedTheme;
        }
        // Fallback to user's system preference
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch (e) {
        // Fallback for security errors or if localStorage is disabled.
        console.warn('Could not access localStorage for theme preference.');
        return 'light';
    }
};

export function useTheme(): [Theme, () => void] {
    const [theme, setTheme] = useState<Theme>(getInitialTheme);

    useEffect(() => {
        // Apply the theme class to the <html> element
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
        } else {
            document.documentElement.classList.add('light');
            document.documentElement.classList.remove('dark');
        }
        
        // Persist the theme to localStorage
        try {
            window.localStorage.setItem('theme', theme);
        } catch (e) {
             console.warn('Could not save theme to localStorage.');
        }
    }, [theme]);

    const toggleTheme = useCallback(() => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    }, []);

    return [theme, toggleTheme];
}
