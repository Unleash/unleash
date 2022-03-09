import { Route, useLocation, Redirect } from 'react-router-dom';

const ProtectedRoute = ({
    component: Component,
    unauthorized,
    renderProps = {},
    ...rest
}) => {
    const { pathname } = useLocation();
    const loginLink =
        pathname.length > 1 ? `/login?redirect=${pathname}` : '/login';
    return (
        <Route
            {...rest}
            render={props => {
                if (unauthorized) {
                    return <Redirect to={loginLink} />;
                } else {
                    return <Component {...props} {...renderProps} />;
                }
            }}
        />
    );
};

export default ProtectedRoute;
