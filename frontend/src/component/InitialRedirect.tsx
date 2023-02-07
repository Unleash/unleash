import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useProjects from '../hooks/api/getters/useProjects/useProjects';
import { useLastViewedProject } from '../hooks/useLastViewedProject';
import Loader from './common/Loader/Loader';

export const InitialRedirect = () => {
    const { lastViewed } = useLastViewedProject();
    const { projects, loading } = useProjects();
    const navigate = useNavigate();

    // Redirect based on project and last viewed
    const getRedirect = useCallback(() => {
        if (projects && lastViewed) {
            return `/projects/${lastViewed}`;
        }

        if (projects && !lastViewed && projects.length === 1) {
            return `/projects/${projects[0].id}`;
        }

        return '/projects';
    }, [lastViewed, projects]);

    const redirect = () => {
        navigate(getRedirect(), { replace: true });
    };

    useEffect(() => {
        redirect();
    }, [getRedirect]);

    if (loading) {
        return <Loader />;
    }

    return null;
};
