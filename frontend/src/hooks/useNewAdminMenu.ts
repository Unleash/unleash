import { useLocation } from 'react-router';

export const useNewAdminMenu = () => {
    const location = useLocation();
    return {
        showOnlyAdminMenu:
            location.pathname.indexOf('/admin') === 0 ||
            location.pathname.indexOf('/history') === 0,
    };
};
