import { IRoute } from 'interfaces/route';
import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';
import { LoginRedirect } from 'component/common/LoginRedirect/LoginRedirect';

interface IProtectedRouteProps {
    route: IRoute;
}

export const ProtectedRoute = ({ route }: IProtectedRouteProps) => {
    const { user } = useAuthUser();
    const isLoggedIn = Boolean(user?.id);

    if (!isLoggedIn && route.type === 'protected') {
        return <LoginRedirect />;
    }

    return <route.component />;
};
