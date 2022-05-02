import { createElement } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { FeedbackNPS } from 'component/feedback/FeedbackNPS/FeedbackNPS';
import { LayoutPicker } from 'component/layout/LayoutPicker/LayoutPicker';
import Loader from 'component/common/Loader/Loader';
import NotFound from 'component/common/NotFound/NotFound';
import ProtectedRoute from 'component/common/ProtectedRoute/ProtectedRoute';
import SWRProvider from 'component/providers/SWRProvider/SWRProvider';
import ToastRenderer from 'component/common/ToastRenderer/ToastRenderer';
import { routes } from 'component/menu/routes';
import { useAuthDetails } from 'hooks/api/getters/useAuth/useAuthDetails';
import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';
import { SplashPageRedirect } from 'component/splash/SplashPageRedirect/SplashPageRedirect';
import { IRoute } from 'interfaces/route';
import styles from 'component/styles.module.scss';

export const App = () => {
    const { authDetails } = useAuthDetails();
    const { user } = useAuthUser();
    const isLoggedIn = Boolean(user?.id);
    const hasFetchedAuth = Boolean(authDetails || user);

    const isUnauthorized = (): boolean => {
        return !isLoggedIn;
    };

    const renderRoute = (route: IRoute) => {
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
                render={() => createElement(route.component, {}, null)}
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
                        <LayoutPicker>
                            <Switch>
                                <ProtectedRoute
                                    exact
                                    path="/"
                                    unauthorized={isUnauthorized()}
                                    component={() => (
                                        <Redirect to="/features" />
                                    )}
                                />
                                {routes.map(renderRoute)}
                                <Route path="/404" component={NotFound} />
                                <Redirect to="/404" />
                            </Switch>
                            <FeedbackNPS openUrl="http://feedback.unleash.run" />
                            <SplashPageRedirect />
                        </LayoutPicker>
                    </div>
                }
            />
        </SWRProvider>
    );
};
