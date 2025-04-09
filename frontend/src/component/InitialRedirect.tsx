import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import { useLastViewedProject } from 'hooks/useLastViewedProject';
import Loader from './common/Loader/Loader';
import { getSessionStorageItem, setSessionStorageItem } from 'utils/storage';
import { useUiFlag } from 'hooks/useUiFlag';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

export const InitialRedirect = () => {
    const { loading } = useUiConfig();
    const flagsReleaseManagementUIEnabled = useUiFlag(
        'flagsReleaseManagementUI',
    );

    if (loading) {
        return <Loader type='fullscreen' />;
    }

    if (flagsReleaseManagementUIEnabled) {
        return <NewInitialRedirect />;
    }

    return <LegacyInitialRedirect />;
};

export const LegacyInitialRedirect = () => {
    const { lastViewed } = useLastViewedProject();
    const { projects, loading } = useProjects();
    const navigate = useNavigate();
    const sessionRedirect = getSessionStorageItem('login-redirect');

    // Redirect based on project and last viewed
    const getRedirect = useCallback(() => {
        if (projects && lastViewed) {
            return `/projects/${lastViewed}`;
        }

        return '/personal';
    }, [lastViewed, projects]);

    const redirect = () => {
        navigate(sessionRedirect ?? getRedirect(), { replace: true });
    };

    useEffect(() => {
        setSessionStorageItem('login-redirect');
        redirect();
    }, [getRedirect]);

    if (loading) {
        return <Loader type='fullscreen' />;
    }

    return null;
};

const NewInitialRedirect = () => {
    const { lastViewed } = useLastViewedProject();
    const { projects, loading } = useProjects();
    const navigate = useNavigate();
    const sessionRedirect = getSessionStorageItem('login-redirect');

    if (loading) {
        return <Loader type='fullscreen' />;
    }

    if (sessionRedirect) {
        setSessionStorageItem('login-redirect');
        navigate(sessionRedirect, { replace: true });
        return null;
    }

    if (projects && lastViewed) {
        navigate(`/projects/${lastViewed}`, { replace: true });
        return null;
    }

    navigate('/personal', { replace: true });

    return null;
};
