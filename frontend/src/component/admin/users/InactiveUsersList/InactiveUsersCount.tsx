import { useInactiveUsers } from 'hooks/api/getters/useInactiveUsers/useInactiveUsers';

export const InactiveUsersCount = () => {
    const { inactiveUsers } = useInactiveUsers();

    return <>{inactiveUsers.length}</>;
};
