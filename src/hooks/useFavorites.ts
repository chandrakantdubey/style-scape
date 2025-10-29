import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'patterncraft_favorites';

export function useFavorites(): [string[], (id: string) => void] {
    const [favorites, setFavorites] = useState<string[]>([]);

    useEffect(() => {
        try {
            const storedFavorites = window.localStorage.getItem(STORAGE_KEY);
            if (storedFavorites) {
                setFavorites(JSON.parse(storedFavorites));
            }
        } catch (error) {
            console.error("Failed to load favorites from localStorage", error);
        }
    }, []);

    const toggleFavorite = useCallback((id: string) => {
        setFavorites(prevFavorites => {
            const newFavorites = prevFavorites.includes(id)
                ? prevFavorites.filter(favId => favId !== id)
                : [...prevFavorites, id];
            
            try {
                window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newFavorites));
            } catch (error) {
                console.error("Failed to save favorites to localStorage", error);
            }
            
            return newFavorites;
        });
    }, []);

    return [favorites, toggleFavorite];
}
