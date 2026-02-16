import { useLocation } from 'react-router-dom';

export const normalizeTopLevelPath = (pathname: string) => {
    const parts = pathname.split('/').filter((part) => part);

    const isEmptyPath =
        parts.length === 0 || (parts[0] === 'admin' && parts.length === 1);
    if (isEmptyPath) {
        return '/projects';
    }

    const isAdminPath = parts[0] === 'admin' && parts.length > 1;
    if (isAdminPath) {
        return `/${parts[0]}/${parts[1]}`;
    }

    return `/${parts[0]}`;
};

export const useInitialPathname = () => {
    const { pathname } = useLocation();

    return normalizeTopLevelPath(pathname);
};
