import { Suspense, useCallback, useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { Error } from 'component/layout/Error/Error';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { FeedbackNPS } from 'component/feedback/FeedbackNPS/FeedbackNPS';
import { LayoutPicker } from 'component/layout/LayoutPicker/LayoutPicker';
import Loader from 'component/common/Loader/Loader';
import NotFound from 'component/common/NotFound/NotFound';
import { ProtectedRoute } from 'component/common/ProtectedRoute/ProtectedRoute';
import { SWRProvider } from 'component/providers/SWRProvider/SWRProvider';
import { PlausibleProvider } from 'component/providers/PlausibleProvider/PlausibleProvider';
import ToastRenderer from 'component/common/ToastRenderer/ToastRenderer';
import { routes } from 'component/menu/routes';
import { useAuthDetails } from 'hooks/api/getters/useAuth/useAuthDetails';
import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';
import { SplashPageRedirect } from 'component/splash/SplashPageRedirect/SplashPageRedirect';
import { useStyles } from './App.styles';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import useProjects from '../hooks/api/getters/useProjects/useProjects';
import { useLastViewedProject } from '../hooks/useLastViewedProject';
import Maintenance from './maintenance/Maintenance';

const InitialRedirect = () => {
    const { lastViewed } = useLastViewedProject();
    const { projects, loading } = useProjects();

    const [redirectTo, setRedirectTo] = useState<string | undefined>();

    const getRedirect = useCallback(() => {
        if (projects && lastViewed) {
            return `/projects/${lastViewed}`;
        }

        if (projects && !lastViewed && projects.length === 1) {
            return `/projects/${projects[0].id}`;
        }

        return '/projects';
    }, [lastViewed, projects]);

    useEffect(() => {
        if (!loading) {
            setRedirectTo(getRedirect());
        }
    }, [loading, getRedirect]);

    if (loading || !redirectTo) {
        return <Loader />;
    }

    return <Navigate to={redirectTo} />;
};

export const App = () => {
    const { authDetails } = useAuthDetails();
    const { user } = useAuthUser();
    const hasFetchedAuth = Boolean(authDetails || user);

    const { classes: styles } = useStyles();
    const { isOss, uiConfig } = useUiConfig();

    const availableRoutes = isOss()
        ? routes.filter(route => !route.enterprise)
        : routes;

    return (
        <ErrorBoundary FallbackComponent={Error}>
            <SWRProvider>
                <Suspense fallback={<Loader />}>
                    <PlausibleProvider>
                        <ConditionallyRender
                            condition={!hasFetchedAuth}
                            show={<Loader />}
                            elseShow={
                                <>
                                    <ConditionallyRender
                                        condition={Boolean(
                                            uiConfig?.flags?.maintenance
                                        )}
                                        show={<Maintenance />}
                                    />
                                    <div className={styles.container}>
                                        <ToastRenderer />
                                        <Routes>
                                            {availableRoutes.map(route => (
                                                <Route
                                                    key={route.path}
                                                    path={route.path}
                                                    element={
                                                        <LayoutPicker
                                                            isStandalone={
                                                                route.isStandalone ===
                                                                true
                                                            }
                                                        >
                                                            <ProtectedRoute
                                                                route={route}
                                                            />
                                                        </LayoutPicker>
                                                    }
                                                />
                                            ))}
                                            <Route
                                                path="/"
                                                element={<InitialRedirect />}
                                            />
                                            <Route
                                                path="*"
                                                element={<NotFound />}
                                            />
                                        </Routes>
                                        <FeedbackNPS openUrl="http://feedback.unleash.run" />
                                        <SplashPageRedirect />
                                    </div>
                                </>
                            }
                        />
                    </PlausibleProvider>
                </Suspense>
            </SWRProvider>
        </ErrorBoundary>
    );
};
