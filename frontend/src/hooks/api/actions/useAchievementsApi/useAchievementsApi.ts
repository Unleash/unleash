import useAPI from '../useApi/useApi';
import { Achievement, Achievements } from 'constants/achievements';
import { IAchievement, IAchievementResult } from 'interfaces/achievement';

export const useAchievementsApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const unlockAchievement = async (
        id: Achievement
    ): Promise<IAchievement | undefined> => {
        const req = createRequest('api/admin/user/achievements', {
            method: 'POST',
            body: JSON.stringify({ id }),
        });
        try {
            const response = await makeRequest(req.caller, req.id);
            const achievementJSON = await response.json();
            return mapAchievement(achievementJSON);
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

const mapAchievement = (achievement: IAchievementResult) => {
    const { id, achievementId } = achievement;

    if (id !== -1 && Object.keys(Achievements).includes(achievementId)) {
        const { title, description, imageUrl } =
            Achievements[achievementId as keyof typeof Achievements];

        return {
            ...achievement,
            title,
            description,
            imageUrl,
        };
    }
};
