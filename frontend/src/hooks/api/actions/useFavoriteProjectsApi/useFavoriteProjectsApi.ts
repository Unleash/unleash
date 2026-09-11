import { useCallback } from 'react';
import useToast from 'hooks/useToast';
import { useTracking } from 'hooks/useTracking';
import type { Tracking } from 'utils/trackingEvents';
import { formatUnknownError } from 'utils/formatUnknownError';
import useAPI from '../useApi/useApi.js';

const projectFavoriteToggledTracking: Tracking = {
    event: 'favorite',
    type: 'project-favorite-toggled',
};

export const useFavoriteProjectsApi = () => {
    const { makeLightRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });
    const { setToastData, setToastApiError } = useToast();
    const trackProjectFavoriteToggled = useTracking(
        projectFavoriteToggledTracking,
    );

    const favorite = useCallback(
        async (projectId: string) => {
            const path = `api/admin/projects/${projectId}/favorites`;
            const req = createRequest(
                path,
                { method: 'POST' },
                'addFavoriteProject',
            );

            try {
                await trackProjectFavoriteToggled.mutation(
                    () => makeLightRequest(req.caller, req.id),
                    { newState: 'favorited' },
                );

                setToastData({
                    text: 'Project added to favorites',
                    type: 'success',
                });
            } catch (error) {
                setToastApiError(formatUnknownError(error));
            }
        },
        [createRequest, makeLightRequest, trackProjectFavoriteToggled],
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
                await trackProjectFavoriteToggled.mutation(
                    () => makeLightRequest(req.caller, req.id),
                    { newState: 'unfavorited' },
                );

                setToastData({
                    text: 'Project removed from favorites',
                    type: 'success',
                });
            } catch (error) {
                setToastApiError(formatUnknownError(error));
            }
        },
        [createRequest, makeLightRequest, trackProjectFavoriteToggled],
    );

    return {
        favorite,
        unfavorite,
        errors,
        loading,
    };
};
