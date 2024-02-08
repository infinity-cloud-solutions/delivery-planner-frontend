import { useLocation } from 'react-router-dom';

export const useQueryParam = (paramName) => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    return queryParams.get(paramName);
};

export const getDateAsQueryParam = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};
