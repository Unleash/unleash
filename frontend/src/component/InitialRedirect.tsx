import { useEffect } from 'react';
import { type Location, Navigate } from 'react-router-dom';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import { useLastViewedProject } from 'hooks/useLastViewedProject';
import Loader from './common/Loader/Loader.tsx';
import { useLocalStorageState } from 'hooks/useLocalStorageState';
import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';

const defaultPage = '/personal';

export const useLastViewedPage = (location?: Location) => {
    const [state, setState] = useLocalStorageState<string>(
        'lastViewedPage',
        defaultPage,
        7 * 24 * 60 * 60 * 1000, // 7 days, left to promote seeing Personal dashboard from time to time
    );

    useEffect(() => {
        if (location) {
            const page = [
                '/personal',
                '/projects',
                '/search',
                '/playground',
                '/insights',
                '/admin',
            ].find(
                (page) =>
                    page === location.pathname ||
                    location.pathname.startsWith(`/{page}/`),
            );
            if (page) {
                setState(page);
            }
        }
    }, [location]);

    return state;
};

export const InitialRedirect = () => {
    const { user, loading: isLoadingAuth } = useAuthUser();
    const { loading: isLoadingProjects } = useProjects();
    const isLoggedIn = Boolean(user?.id);
    const lastViewedPage = useLastViewedPage();
    const { lastViewed: lastViewedProject } = useLastViewedProject();

    if (isLoadingAuth || isLoadingProjects) {
        return <Loader type='fullscreen' />;
    }

    if (!isLoggedIn) {
        return <Navigate to='/login' replace />;
    }

    if (lastViewedPage === '/projects' && lastViewedProject) {
        return <Navigate to={`/projects/${lastViewedProject}`} replace />;
    }

    if (lastViewedPage && lastViewedPage !== '/') {
        return <Navigate to={lastViewedPage} replace />;
    }

    return <Navigate to={defaultPage} replace />;
};
