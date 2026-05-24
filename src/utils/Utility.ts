import { useLocation } from 'react-router-dom';

export const useQueryParam = (paramName: string): string | null => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    return queryParams.get(paramName);
};

export const getDateAsQueryParam = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const getAvailableDriverIds = (): number[] => {
    try {
        const raw = process.env.REACT_APP_DRIVERS_MAP ?? '{}';
        const map: Record<string, number> = JSON.parse(raw);
        return [...new Set(Object.values(map))].sort((a, b) => a - b);
    } catch {
        return [1, 2];
    }
};
