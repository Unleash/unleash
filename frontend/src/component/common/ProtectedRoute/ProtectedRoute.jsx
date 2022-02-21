import { Route, useLocation, useHistory } from 'react-router-dom';

const ProtectedRoute = ({
    component: Component,
    unauthorized,
    renderProps = {},
    ...rest
}) => {
    const { pathname } = useLocation();
    const history = useHistory();
    const loginLink =
        pathname.length > 1 ? `/login?redirect=${pathname}` : '/login';
    return (
        <Route
            {...rest}
            render={props => {
                if (unauthorized) {
                    history.push(loginLink);
                } else {
                    return <Component {...props} {...renderProps} />;
                }
            }}
        />
    );
};

export default ProtectedRoute;
