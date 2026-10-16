import { useState } from 'react';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled.ts';
import { usePendingChangeRequests } from 'hooks/api/getters/usePendingChangeRequests/usePendingChangeRequests.ts';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature.ts';
import useFeatureStrategyApi from 'hooks/api/actions/useFeatureStrategyApi/useFeatureStrategyApi.ts';
import { useChangeRequestApi } from 'hooks/api/actions/useChangeRequestApi/useChangeRequestApi.ts';
import useToast from 'hooks/useToast.tsx';
import { useTracking } from 'hooks/useTracking';
import { formatUnknownError } from 'utils/formatUnknownError';
import {
    createStrategyTracking,
    strategyTypeProps,
} from '../strategyActionsTracking.ts';
import { useEnvironmentDefaultStrategy } from './useEnvironmentDefaultStrategy.ts';

interface IProjectDefaultStrategyOptions {
    projectId: string;
    featureId: string;
    environmentId: string;
}

export const useProjectDefaultStrategy = ({
    projectId,
    featureId,
    environmentId,
}: IProjectDefaultStrategyOptions) => {
    const { defaultStrategy, loading } = useEnvironmentDefaultStrategy(
        projectId,
        environmentId,
    );
    const { addStrategyToFeature } = useFeatureStrategyApi();
    const { addChange } = useChangeRequestApi();
    const { setToastData, setToastApiError } = useToast();
    const { isChangeRequestConfigured } = useChangeRequestsEnabled(projectId);
    const { refetch: refetchChangeRequests } =
        usePendingChangeRequests(projectId);
    const { refetchFeature } = useFeature(projectId, featureId);
    const trackCreateStrategy = useTracking(createStrategyTracking);
    const [applying, setApplying] = useState(false);

    const applyDefaultStrategy = async () => {
        const payload = {
            name: defaultStrategy.name,
            title: defaultStrategy.title ?? '',
            constraints: defaultStrategy.constraints ?? [],
            parameters: defaultStrategy.parameters ?? {},
            variants: defaultStrategy.variants ?? [],
            segments: defaultStrategy.segments ?? [],
            disabled: defaultStrategy.disabled ?? false,
        };

        setApplying(true);
        try {
            await trackCreateStrategy.mutation(
                async () => {
                    if (isChangeRequestConfigured(environmentId)) {
                        await addChange(projectId, environmentId, {
                            action: 'addStrategy',
                            feature: featureId,
                            payload,
                        });

                        setToastData({
                            text: 'Strategy added to draft',
                            type: 'success',
                        });
                        refetchChangeRequests();
                    } else {
                        await addStrategyToFeature(
                            projectId,
                            featureId,
                            environmentId,
                            payload,
                        );

                        setToastData({
                            text: 'Strategy applied',
                            type: 'success',
                        });
                    }
                },
                strategyTypeProps({
                    selectedStrategyName: defaultStrategy.name,
                    defaultStrategyName: defaultStrategy.name,
                }),
            );

            refetchFeature();
            return true;
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
            return false;
        } finally {
            setApplying(false);
        }
    };

    return { defaultStrategy, applyDefaultStrategy, loading, applying };
};
