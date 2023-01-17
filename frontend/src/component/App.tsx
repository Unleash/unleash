import { Suspense, useCallback, useEffect, useState, useRef } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
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
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import useProjects from '../hooks/api/getters/useProjects/useProjects';
import { useLastViewedProject } from '../hooks/useLastViewedProject';
import MaintenanceBanner from './maintenance/MaintenanceBanner';
import { styled } from '@mui/material';

const InitialRedirect = () => {
    const { lastViewed } = useLastViewedProject();
    const { projects, loading } = useProjects();
    const navigate = useNavigate();
    const ref = useRef<{ redirected: boolean }>({ redirected: false });

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
        ref.current = { redirected: true };
        navigate(getRedirect(), { replace: true });
    };

    useEffect(() => {
        if (ref.current?.redirected === true) return;

        redirect();
    }, [getRedirect]);

    if (loading) {
        return <Loader />;
    }

    return <></>;
};

const StyledContainer = styled('div')(() => ({
    '& ul': {
        margin: 0,
    },
}));

export const App = () => {
    const { authDetails } = useAuthDetails();
    const { user } = useAuthUser();
    const hasFetchedAuth = Boolean(authDetails || user);

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
                                        condition={
                                            Boolean(
                                                uiConfig?.flags?.maintenance
                                            ) &&
                                            Boolean(uiConfig?.maintenanceMode)
                                        }
                                        show={<MaintenanceBanner />}
                                    />
                                    <StyledContainer>
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
                                                path="*"
                                                element={<NotFound />}
                                            />
                                        </Routes>
                                        <ConditionallyRender
                                            condition={
                                                !(
                                                    import.meta.env
                                                        .VITE_TEST_REDIRECT ===
                                                    'true'
                                                )
                                            }
                                            show={<InitialRedirect />}
                                        />

                                        <InitialRedirect />
                                        <FeedbackNPS openUrl="http://feedback.unleash.run" />

                                        <SplashPageRedirect />
                                    </StyledContainer>
                                </>
                            }
                        />
                    </PlausibleProvider>
                </Suspense>
            </SWRProvider>
        </ErrorBoundary>
    );
};
