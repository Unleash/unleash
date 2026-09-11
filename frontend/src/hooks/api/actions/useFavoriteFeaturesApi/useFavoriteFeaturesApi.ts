import { useCallback } from 'react';
import useToast from 'hooks/useToast';
import { useTracking } from 'hooks/useTracking';
import type { Tracking } from 'utils/trackingEvents';
import { formatUnknownError } from 'utils/formatUnknownError';
import useAPI from '../useApi/useApi.js';

const featureFavoriteToggledTracking: Tracking = {
    event: 'favorite',
    type: 'feature-favorite-toggled',
};

export const useFavoriteFeaturesApi = () => {
    const { makeLightRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });
    const { setToastData, setToastApiError } = useToast();
    const trackFeatureFavoriteToggled = useTracking(
        featureFavoriteToggledTracking,
    );

    const favorite = useCallback(
        async (projectId: string, featureName: string) => {
            const path = `api/admin/projects/${projectId}/features/${featureName}/favorites`;
            const req = createRequest(
                path,
                { method: 'POST' },
                'addFavoriteFeature',
            );

            try {
                await trackFeatureFavoriteToggled.mutation(
                    () => makeLightRequest(req.caller, req.id),
                    { newState: 'favorited' },
                );

                setToastData({
                    text: 'Feature flag added to favorites',
                    type: 'success',
                });
            } catch (error) {
                setToastApiError(formatUnknownError(error));
            }
        },
        [createRequest, makeLightRequest, trackFeatureFavoriteToggled],
    );

    const unfavorite = useCallback(
        async (projectId: string, featureName: string) => {
            const path = `api/admin/projects/${projectId}/features/${featureName}/favorites`;
            const req = createRequest(
                path,
                { method: 'DELETE' },
                'removeFavoriteFeature',
            );

            try {
                await trackFeatureFavoriteToggled.mutation(
                    () => makeLightRequest(req.caller, req.id),
                    { newState: 'unfavorited' },
                );

                setToastData({
                    text: 'Feature flag removed from favorites',
                    type: 'success',
                });
            } catch (error) {
                setToastApiError(formatUnknownError(error));
            }
        },
        [createRequest, makeLightRequest, trackFeatureFavoriteToggled],
    );

    return {
        favorite,
        unfavorite,
        errors,
        loading,
    };
};
