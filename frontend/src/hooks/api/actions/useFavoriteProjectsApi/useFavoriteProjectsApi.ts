import { useCallback } from 'react';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import useAPI from '../useApi/useApi.js';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';

export const useFavoriteProjectsApi = () => {
    const { makeLightRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });
    const { setToastData, setToastApiError } = useToast();
    const { trackEvent } = usePlausibleTracker();

    const favorite = useCallback(
        async (projectId: string) => {
            const path = `api/admin/projects/${projectId}/favorites`;
            const req = createRequest(
                path,
                { method: 'POST' },
                'addFavoriteProject',
            );

            try {
                await makeLightRequest(req.caller, req.id);

                setToastData({
                    text: 'Project added to favorites',
                    type: 'success',
                });
                trackEvent('favorite', {
                    props: {
                        eventType: `project favorited`,
                    },
                });
            } catch (error) {
                setToastApiError(formatUnknownError(error));
            }
        },
        [createRequest, makeLightRequest],
    );

    const unfavorite = useCallback(
        async (projectId: string) => {
            const path = `api/admin/projects/${projectId}/favorites`;
            const req = createRequest(
                path,
                { method: 'DELETE' },
                'removeFavoriteProject',
            );

            try {
                await makeLightRequest(req.caller, req.id);

                setToastData({
                    text: 'Project removed from favorites',
                    type: 'success',
                });
                trackEvent('favorite', {
                    props: {
                        eventType: `project unfavorited`,
                    },
                });
            } catch (error) {
                setToastApiError(formatUnknownError(error));
            }
        },
        [createRequest, makeLightRequest],
    );

    return {
        favorite,
        unfavorite,
        errors,
        loading,
    };
};
