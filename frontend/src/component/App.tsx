import { Navigate, Route, Routes } from 'react-router-dom';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { FeedbackNPS } from 'component/feedback/FeedbackNPS/FeedbackNPS';
import { LayoutPicker } from 'component/layout/LayoutPicker/LayoutPicker';
import Loader from 'component/common/Loader/Loader';
import NotFound from 'component/common/NotFound/NotFound';
import { ProtectedRoute } from 'component/common/ProtectedRoute/ProtectedRoute';
import SWRProvider from 'component/providers/SWRProvider/SWRProvider';
import ToastRenderer from 'component/common/ToastRenderer/ToastRenderer';
import { routes } from 'component/menu/routes';
import { useAuthDetails } from 'hooks/api/getters/useAuth/useAuthDetails';
import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';
import { SplashPageRedirect } from 'component/splash/SplashPageRedirect/SplashPageRedirect';
import { useStyles } from './App.styles';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

export const App = () => {
    const { classes: styles } = useStyles();
    const { authDetails } = useAuthDetails();
    const { user } = useAuthUser();
    const { isOss } = useUiConfig();
    const isLoggedIn = Boolean(user?.id);
    const hasFetchedAuth = Boolean(authDetails || user);
    usePlausibleTracker();

    const availableRoutes = isOss()
        ? routes.filter(route => !route.enterprise)
        : routes;

    return (
        <SWRProvider isUnauthorized={!isLoggedIn}>
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
                                            <ProtectedRoute route={route} />
                                        }
                                    />
                                ))}
                                <Route
                                    path="/"
                                    element={
                                        <Navigate to="/features" replace />
                                    }
                                />
                                <Route path="*" element={<NotFound />} />
                            </Routes>
                            <FeedbackNPS openUrl="http://feedback.unleash.run" />
                            <SplashPageRedirect />
                        </LayoutPicker>
                    </div>
                }
            />
        </SWRProvider>
    );
};
