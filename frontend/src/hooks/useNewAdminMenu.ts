import { useUiFlag } from './useUiFlag';
import { useLocation } from 'react-router';

export const useNewAdminMenu = () => {
    const newAdminUIEnabled = useUiFlag('adminNavUI');
    const location = useLocation();
    return (
        newAdminUIEnabled &&
        (location.pathname.indexOf('/admin') === 0 ||
            location.pathname.indexOf('/history') === 0)
    );
};
