import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';

const NEW_USER_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;

export const useIsNewUser = (): boolean => {
    const { user } = useAuthUser();

    if (!user?.createdAt) {
        return false;
    }

    const createdAtMs = new Date(user.createdAt).getTime();
    if (Number.isNaN(createdAtMs)) {
        return false;
    }

    return Date.now() - createdAtMs < NEW_USER_WINDOW_MS;
};
