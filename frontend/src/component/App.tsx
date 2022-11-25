import { Suspense, useEffect } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
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
import { IProjectCard } from '../interfaces/project';
import { useLastViewedProject } from '../hooks/useLastViewedProject';
import useQueryParams from '../hooks/useQueryParams';

export const App = () => {
    const { classes: styles } = useStyles();
    const { authDetails } = useAuthDetails();
    const { user } = useAuthUser();
    const { isOss } = useUiConfig();
    const hasFetchedAuth = Boolean(authDetails || user);

    const { projects, refetch } = useProjects();

    const availableRoutes = isOss()
        ? routes.filter(route => !route.enterprise)
        : routes;

    const MainApp = () => {
        const { lastViewed } = useLastViewedProject();
        const navigate = useNavigate();
        const query = useQueryParams();

        useEffect(() => {
            if (hasFetchedAuth) {
                const getRedirect = (projects: IProjectCard[]) => {
                    if (lastViewed) {
                        return `/projects/${lastViewed}`;
                    }

                    if (projects.length === 1) {
                        return `/projects/${projects[0].id}`;
                    }

                    return '/projects';
                };

                if (hasFetchedAuth) {
                    if (!projects) {
                        refetch();
                    } else {
                        const redirect =
                            query.get('redirect') || getRedirect(projects);
                        navigate(redirect);
                    }
                }
            }
        }, [lastViewed, navigate, query]);

        return (
            <div className={styles.container}>
                <ToastRenderer />
                <Routes>
                    {availableRoutes.map(route => (
                        <Route
                            key={route.path}
                            path={route.path}
                            element={
                                <LayoutPicker
                                    isStandalone={route.isStandalone === true}
                                >
                                    <ProtectedRoute route={route} />
                                </LayoutPicker>
                            }
                        />
                    ))}
                    <Route
                        path="/"
                        element={<Navigate to="/projects" replace />}
                    />
                    <Route path="*" element={<NotFound />} />
                </Routes>
                <FeedbackNPS openUrl="http://feedback.unleash.run" />
                <SplashPageRedirect />
            </div>
        );
    };

    return (
        <ErrorBoundary FallbackComponent={Error}>
            <SWRProvider>
                <Suspense fallback={<Loader />}>
                    <PlausibleProvider>
                        <ConditionallyRender
                            condition={!hasFetchedAuth}
                            show={<Loader />}
                            elseShow={<MainApp />}
                        />
                    </PlausibleProvider>
                </Suspense>
            </SWRProvider>
        </ErrorBoundary>
    );
};
