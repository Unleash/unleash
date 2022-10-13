import useAPI from '../useApi/useApi';

export const useAchievementsApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const markAchievementSeen = async (id: number) => {
        const req = createRequest('api/admin/user/achievements', {
            method: 'POST',
            body: JSON.stringify({ id }),
        });
        try {
            await makeRequest(req.caller, req.id);
        } catch (e) {
            throw e;
        }
    };

    return {
        markAchievementSeen,
        errors,
        loading,
    };
};
