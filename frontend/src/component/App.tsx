import { connect } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router-dom';
import { RouteComponentProps } from 'react-router';

import ProtectedRoute from './common/ProtectedRoute/ProtectedRoute';
import LayoutPicker from './layout/LayoutPicker/LayoutPicker';

import { routes } from './menu/routes';

import styles from './styles.module.scss';

import IAuthStatus from '../interfaces/user';
import { useState, useEffect } from 'react';
import NotFound from './common/NotFound/NotFound';
import Feedback from './common/Feedback/Feedback';
import SWRProvider from './providers/SWRProvider/SWRProvider';
import ConditionallyRender from './common/ConditionallyRender';
import EnvironmentSplash from './common/EnvironmentSplash/EnvironmentSplash';
import Loader from './common/Loader/Loader';
import useUser from '../hooks/api/getters/useUser/useUser';
import ToastRenderer from './common/ToastRenderer/ToastRenderer';

interface IAppProps extends RouteComponentProps {
    user: IAuthStatus;
    fetchUiBootstrap: any;
    feedback: any;
}
const App = ({ location, user, fetchUiBootstrap }: IAppProps) => {
    // because we need the userId when the component load.
    const { splash, user: userFromUseUser, authDetails } = useUser();

    const [showSplash, setShowSplash] = useState(false);
    const [showLoader, setShowLoader] = useState(false);
    useEffect(() => {
        fetchUiBootstrap();
        /* eslint-disable-next-line */
    }, [user.authDetails?.type]);

    useEffect(() => {
        // Temporary duality until redux store is removed
        if (!isUnauthorized() && !userFromUseUser?.id && !authDetails) {
            setShowLoader(true);
            return;
        }
        setShowLoader(false);
        /* eslint-disable-next-line */
    }, [user.authDetails, userFromUseUser.id]);

    useEffect(() => {
        if (splash?.environment === undefined) return;
        if (!splash?.environment && !isUnauthorized()) {
            setShowSplash(true);
        }
        /* eslint-disable-next-line */
    }, [splash.environment]);

    const renderMainLayoutRoutes = () => {
        return routes.filter(route => route.layout === 'main').map(renderRoute);
    };

    const renderStandaloneRoutes = () => {
        return routes
            .filter(route => route.layout === 'standalone')
            .map(renderRoute);
    };

    const isUnauthorized = () => {
        // authDetails only exists if the user is not logged in.
        //if (user?.permissions.length === 0) return true;
        return user?.authDetails !== undefined;
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
                        authDetails={user.authDetails}
                    />
                )}
            />
        );
    };

    return (
        <SWRProvider
            isUnauthorized={isUnauthorized}
            setShowLoader={setShowLoader}
        >
            <ConditionallyRender
                condition={showLoader}
                show={<Loader />}
                elseShow={
                    <div className={styles.container}>
                        <ToastRenderer />

                        <ConditionallyRender
                            condition={showSplash}
                            show={
                                <EnvironmentSplash onFinish={setShowSplash} />
                            }
                            elseShow={
                                <LayoutPicker location={location}>
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
                                    <Feedback
                                        feedbackId="pnps"
                                        openUrl="http://feedback.unleash.run"
                                    />
                                </LayoutPicker>
                            }
                        />
                    </div>
                }
            />
        </SWRProvider>
    );
};
// Set state to any for now, to avoid typing up entire state object while converting to tsx.
const mapStateToProps = (state: any) => ({
    user: state.user.toJS(),
    feedback: state.feedback,
});

export default connect(mapStateToProps)(App);
