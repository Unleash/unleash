import { useAuthSplash } from 'hooks/api/getters/useAuth/useAuthSplash';
import { useLocation, Redirect } from 'react-router-dom';
import { matchPath } from 'react-router';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { IFlags } from 'interfaces/uiConfig';
import { IAuthSplash } from 'hooks/api/getters/useAuth/useAuthEndpoint';
import { activeSplashIds, SplashId } from 'component/splash/splash';

export const SplashPageRedirect = () => {
    const { pathname } = useLocation();
    const { splash } = useAuthSplash();
    const { uiConfig, loading } = useUiConfig();

    if (!splash || !uiConfig || loading) {
        // Wait for everything to load.
        return null;
    }

    if (matchPath(pathname, { path: '/splash/:splashId' })) {
        // We've already redirected to the splash page.
        return null;
    }

    // Find the splash page to show (if any).
    const showSplashId = activeSplashIds.find(splashId => {
        return (
            isSplashRelevant(splashId, uiConfig.flags) &&
            !hasSeenSplashId(splashId, splash)
        );
    });

    if (!showSplashId) {
        return null;
    }

    return <Redirect to={`/splash/${showSplashId}`} />;
};

const hasSeenSplashId = (splashId: SplashId, splash: IAuthSplash): boolean => {
    return Boolean(splash[splashId]);
};

const isSplashRelevant = (splashId: SplashId, flags: IFlags): boolean => {
    if (splashId === 'operators') {
        return Boolean(flags.C || flags.CO);
    }

    return true;
};
