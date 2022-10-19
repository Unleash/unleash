import { useAuthSplash } from 'hooks/api/getters/useAuth/useAuthSplash';
import { useLocation, Navigate } from 'react-router-dom';
import { matchPath } from 'react-router';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { IAuthSplash } from 'hooks/api/getters/useAuth/useAuthEndpoint';
import { activeSplashIds, SplashId } from 'component/splash/splash';
import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';

export const SplashPageRedirect = () => {
    const { pathname } = useLocation();
    const { user } = useAuthUser();
    const { splash } = useAuthSplash();
    const { uiConfig, loading } = useUiConfig();

    if (!user || !splash || !uiConfig || loading) {
        // Wait for everything to load.
        return null;
    }

    if (matchPath('/splash/:splashId', pathname)) {
        // We've already redirected to the splash page.
        return null;
    }

    // Read-only API users should never see splash screens
    // since they don't have access to mark them as seen.
    if (user.isAPI) {
        return null;
    }

    // Find the splash page to show (if any).
    const showSplashId = activeSplashIds.find(splashId => {
        return !hasSeenSplashId(splashId, splash);
    });

    if (!showSplashId) {
        return null;
    }

    return <Navigate to={`/splash/${showSplashId}`} replace />;
};

const hasSeenSplashId = (splashId: SplashId, splash: IAuthSplash): boolean => {
    return Boolean(splash[splashId]);
};
