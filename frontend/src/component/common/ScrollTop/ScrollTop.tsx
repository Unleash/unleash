import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const ScrollTop = (): null => {
    const { pathname } = useLocation();

    useEffect(() => {
        if (!noScrollPaths.some(noScroll => pathname.includes(noScroll))) {
            window.scrollTo(0, 0);
        }
    }, [pathname]);

    return null;
};

const noScrollPaths = [
    '/admin/api',
    '/admin/users',
    '/admin/auth',
    '/admin/roles',
];
