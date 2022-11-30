import { useCallback } from 'react';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useFeatures } from 'hooks/api/getters/useFeatures/useFeatures';
import useAPI from '../useApi/useApi';

export const useFavoriteFeaturesApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });
    const { setToastData, setToastApiError } = useToast();
    const { refetchFeatures } = useFeatures();

    const favorite = useCallback(
        async (projectId: string, featureName: string) => {
            const path = `api/admin/projects/${projectId}/features/${featureName}/favorites`;
            const req = createRequest(
                path,
                { method: 'POST' },
                'addFavoriteFeature'
            );

            try {
                await makeRequest(req.caller, req.id);

                setToastData({
                    title: 'Toggle added to favorites',
                    type: 'success',
                });
                refetchFeatures();
            } catch (error) {
                setToastApiError(formatUnknownError(error));
            }
        },
        [createRequest, makeRequest]
    );

    const unfavorite = useCallback(
        async (projectId: string, featureName: string) => {
            const path = `api/admin/projects/${projectId}/features/${featureName}/favorites`;
            const req = createRequest(
                path,
                { method: 'DELETE' },
                'removeFavoriteFeature'
            );

            try {
                await makeRequest(req.caller, req.id);

                setToastData({
                    title: 'Toggle removed from favorites',
                    type: 'success',
                });
                refetchFeatures();
            } catch (error) {
                setToastApiError(formatUnknownError(error));
            }
        },
        [createRequest, makeRequest]
    );

    return {
        favorite,
        unfavorite,
        errors,
        loading,
    };
};
