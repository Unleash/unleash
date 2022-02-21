import ConditionallyRender from './common/ConditionallyRender';
import EnvironmentSplash from './common/EnvironmentSplash/EnvironmentSplash';
import Feedback from './common/Feedback/Feedback';
import LayoutPicker from './layout/LayoutPicker/LayoutPicker';
import Loader from './common/Loader/Loader';
import NotFound from './common/NotFound/NotFound';
import ProtectedRoute from './common/ProtectedRoute/ProtectedRoute';
import SWRProvider from './providers/SWRProvider/SWRProvider';
import ToastRenderer from './common/ToastRenderer/ToastRenderer';
import styles from './styles.module.scss';
import { Redirect, Route, Switch } from 'react-router-dom';
import { routes } from './menu/routes';
import { useAuthDetails } from '../hooks/api/getters/useAuth/useAuthDetails';
import { useAuthUser } from '../hooks/api/getters/useAuth/useAuthUser';
import { useAuthSplash } from '../hooks/api/getters/useAuth/useAuthSplash';

export const App = () => {
    const { splash, refetchSplash } = useAuthSplash();
    const { authDetails } = useAuthDetails();
    const { user } = useAuthUser();

    const isLoggedIn = Boolean(user?.id);
    const hasFetchedAuth = Boolean(authDetails || user);
    const showEnvSplash = isLoggedIn && splash?.environment === false;

    const renderMainLayoutRoutes = () => {
        return routes.filter(route => route.layout === 'main').map(renderRoute);
    };

    const renderStandaloneRoutes = () => {
        return routes
            .filter(route => route.layout === 'standalone')
            .map(renderRoute);
    };

    const isUnauthorized = (): boolean => {
        return !isLoggedIn;
    };

    // Change this to IRoute once snags with HashRouter and TS is worked out
    const renderRoute = (route: any) => {
        if (route.type === 'protected') {
            const unauthorized = isUnauthorized();
            return (
                <ProtectedRoute
                    key={route.path}
                    path={route.path}
                    component={route.component}
                    unauthorized={unauthorized}
                />
            );
        }
        return (
            <Route
                key={route.path}
                path={route.path}
                render={props => (
                    <route.component
                        {...props}
                        isUnauthorized={isUnauthorized}
                        authDetails={authDetails}
                    />
                )}
            />
        );
    };

    return (
        <SWRProvider isUnauthorized={isUnauthorized}>
            <ConditionallyRender
                condition={!hasFetchedAuth}
                show={<Loader />}
                elseShow={
                    <div className={styles.container}>
                        <ToastRenderer />

                        <ConditionallyRender
                            condition={showEnvSplash}
                            show={
                                <EnvironmentSplash onFinish={refetchSplash} />
                            }
                            elseShow={
                                <LayoutPicker>
                                    <Switch>
                                        <ProtectedRoute
                                            exact
                                            path="/"
                                            unauthorized={isUnauthorized()}
                                            component={Redirect}
                                            renderProps={{ to: '/features' }}
                                        />
                                        {renderMainLayoutRoutes()}
                                        {renderStandaloneRoutes()}
                                        <Route
                                            path="/404"
                                            component={NotFound}
                                        />
                                        <Redirect to="/404" />
                                    </Switch>
                                    <Feedback openUrl="http://feedback.unleash.run" />
                                </LayoutPicker>
                            }
                        />
                    </div>
                }
            />
        </SWRProvider>
    );
};
