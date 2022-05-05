import { useLocation, Navigate } from 'react-router-dom';

export const LoginRedirect = () => {
    const { pathname, search } = useLocation();

    const redirect = encodeURIComponent(pathname + search);
    const loginLink = `/login?redirect=${redirect}`;

    return <Navigate to={loginLink} replace />;
};
