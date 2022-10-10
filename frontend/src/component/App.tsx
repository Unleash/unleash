import { Suspense } from 'react';
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

export const App = () => {
    const { classes: styles } = useStyles();
    const { authDetails } = useAuthDetails();
    const { user } = useAuthUser();
    const { isOss } = useUiConfig();
    const hasFetchedAuth = Boolean(authDetails || user);

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
                                <div className={styles.container}>
                                    <ToastRenderer />
                                    <LayoutPicker>
                                        <Routes>
                                            {availableRoutes.map(route => (
                                                <Route
                                                    key={route.path}
                                                    path={route.path}
                                                    element={
                                                        <ProtectedRoute
                                                            route={route}
                                                        />
                                                    }
                                                />
                                            ))}
                                            <Route
                                                path="/"
                                                element={
                                                    <Navigate
                                                        to="/features"
                                                        replace
                                                    />
                                                }
                                            />
                                            <Route
                                                path="*"
                                                element={<NotFound />}
                                            />
                                        </Routes>
                                        <FeedbackNPS openUrl="http://feedback.unleash.run" />
                                        <SplashPageRedirect />
                                    </LayoutPicker>
                                </div>
                            }
                        />
                    </PlausibleProvider>
                </Suspense>
            </SWRProvider>
        </ErrorBoundary>
    );
};
