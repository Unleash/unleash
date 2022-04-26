import { Route, useLocation, Redirect } from 'react-router-dom';

const ProtectedRoute = ({
    component: Component,
    unauthorized,
    renderProps = {},
    ...rest
}) => {
    const { pathname, search } = useLocation();
    const redirect = encodeURIComponent(pathname + search);
    const loginLink = `/login?redirect=${redirect}`;

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
