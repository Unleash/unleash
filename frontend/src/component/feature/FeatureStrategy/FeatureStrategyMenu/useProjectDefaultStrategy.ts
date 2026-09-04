import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled.ts';
import { usePendingChangeRequests } from 'hooks/api/getters/usePendingChangeRequests/usePendingChangeRequests.ts';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature.ts';
import useFeatureStrategyApi from 'hooks/api/actions/useFeatureStrategyApi/useFeatureStrategyApi.ts';
import { useChangeRequestApi } from 'hooks/api/actions/useChangeRequestApi/useChangeRequestApi.ts';
import useToast from 'hooks/useToast.tsx';
import useProjectOverview from 'hooks/api/getters/useProjectOverview/useProjectOverview';
import { useEventTracker } from 'hooks/useEventTracker';
import { formatStrategyName } from 'utils/strategyNames';
import type { CreateFeatureStrategySchema } from 'openapi';

const FALLBACK_DEFAULT_STRATEGY: CreateFeatureStrategySchema = {
    name: 'flexibleRollout',
    title: '100% of all users',
};

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
    const { project, loading } = useProjectOverview(projectId);
    const { addStrategyToFeature } = useFeatureStrategyApi();
    const { addChange } = useChangeRequestApi();
    const { setToastData } = useToast();
    const { isChangeRequestConfigured } = useChangeRequestsEnabled(projectId);
    const { refetch: refetchChangeRequests } =
        usePendingChangeRequests(projectId);
    const { refetchFeature } = useFeature(projectId, featureId);
    const { trackEvent } = useEventTracker();

    const defaultStrategy =
        project?.environments?.find((env) => env.environment === environmentId)
            ?.defaultStrategy || FALLBACK_DEFAULT_STRATEGY;

    const applyDefaultStrategy = async () => {
        trackEvent('strategy-add', {
            props: {
                buttonTitle: formatStrategyName(defaultStrategy.name),
            },
        });

        const payload = {
            name: defaultStrategy.name,
            title: defaultStrategy.title ?? '',
            constraints: defaultStrategy.constraints ?? [],
            parameters: defaultStrategy.parameters ?? {},
            variants: defaultStrategy.variants ?? [],
            segments: defaultStrategy.segments ?? [],
            disabled: defaultStrategy.disabled ?? false,
        };

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

        refetchFeature();
    };

    return { defaultStrategy, applyDefaultStrategy, loading };
};
