import { useInactiveUsers } from 'hooks/api/getters/useInactiveUsers/useInactiveUsers';

export const InactiveUsersCount = () => {
    const { totalInactiveUsers } = useInactiveUsers();

    return <>{totalInactiveUsers}</>;
};
