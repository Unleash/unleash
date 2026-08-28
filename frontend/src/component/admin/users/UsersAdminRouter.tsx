import { useUiFlag } from 'hooks/useUiFlag';
import UsersAdminDeprecated from './UsersAdminDeprecated.tsx';
import UsersTabs from './UsersTabs/UsersTabs.tsx';

export const UsersAdminRouter = () => {
    const usersTabsUI = useUiFlag('usersTabsUI');

    return usersTabsUI ? <UsersTabs /> : <UsersAdminDeprecated />;
};

export default UsersAdminRouter;
