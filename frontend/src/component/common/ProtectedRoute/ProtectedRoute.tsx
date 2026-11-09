import type { IRoute } from 'interfaces/route';
import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';
import { LoginRedirect } from 'component/common/LoginRedirect/LoginRedirect';
import { LayoutPicker } from 'component/layout/LayoutPicker/LayoutPicker';

interface IProtectedRouteProps {
    route: IRoute;
}

export const ProtectedRoute = ({ route }: IProtectedRouteProps) => {
    const { user } = useAuthUser();
    const isLoggedIn = Boolean(user?.id);

    if (!isLoggedIn && route.type === 'protected') {
        return <LoginRedirect />;
    }

    return (
        <LayoutPicker isStandalone={route.isStandalone === true}>
            <route.component />
        </LayoutPicker>
    );
};
