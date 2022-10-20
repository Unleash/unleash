import useAPI from '../useApi/useApi';
import { Achievement } from 'constants/achievements';
import { IAchievementUnlock } from 'interfaces/achievement';

export const useAchievementsApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const unlockAchievement = async (
        id: Achievement
    ): Promise<IAchievementUnlock> => {
        const req = createRequest('api/admin/user/achievements', {
            method: 'POST',
            body: JSON.stringify({ id }),
        });
        try {
            const response = await makeRequest(req.caller, req.id);
            return await response.json();
        } catch (e) {
            throw e;
        }
    };

    const markAchievementSeen = async (id: number) => {
        const req = createRequest('api/admin/user/achievements', {
            method: 'PUT',
            body: JSON.stringify({ id }),
        });
        try {
            await makeRequest(req.caller, req.id);
        } catch (e) {
            throw e;
        }
    };

    return {
        unlockAchievement,
        markAchievementSeen,
        errors,
        loading,
    };
};
