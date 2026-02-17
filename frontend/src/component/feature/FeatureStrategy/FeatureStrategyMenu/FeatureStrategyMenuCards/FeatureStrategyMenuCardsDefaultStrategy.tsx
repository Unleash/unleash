import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled.ts';
import { usePendingChangeRequests } from 'hooks/api/getters/usePendingChangeRequests/usePendingChangeRequests.ts';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature.ts';
import useFeatureStrategyApi from 'hooks/api/actions/useFeatureStrategyApi/useFeatureStrategyApi.ts';
import { useChangeRequestApi } from 'hooks/api/actions/useChangeRequestApi/useChangeRequestApi.ts';
import useToast from 'hooks/useToast.tsx';
import useProjectOverview from 'hooks/api/getters/useProjectOverview/useProjectOverview';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { FeatureStrategyMenuCard } from '../FeatureStrategyMenuCard/FeatureStrategyMenuCard.tsx';
import { FeatureStrategyMenuCardAction } from '../FeatureStrategyMenuCard/FeatureStrategyMenuCardAction.tsx';
import { FeatureStrategyMenuCardIcon } from '../FeatureStrategyMenuCard/FeatureStrategyMenuCardIcon.tsx';
import { formatStrategyName } from 'utils/strategyNames';

interface IFeatureStrategyMenuCardsDefaultStrategyProps {
    projectId: string;
    featureId: string;
    environmentId: string;
    onConfigure: ({
        strategyName,
        strategyDisplayName,
        isDefault,
    }: {
        strategyName: string;
        strategyDisplayName?: string;
        isDefault: boolean;
    }) => void;
    onClose: () => void;
}

export const FeatureStrategyMenuCardsDefaultStrategy = ({
    projectId,
    environmentId,
    featureId,
    onConfigure,
    onClose,
}: IFeatureStrategyMenuCardsDefaultStrategyProps) => {
    const { project } = useProjectOverview(projectId);
    const { addStrategyToFeature } = useFeatureStrategyApi();
    const { addChange } = useChangeRequestApi();
    const { setToastData } = useToast();
    const { isChangeRequestConfigured } = useChangeRequestsEnabled(projectId);
    const { refetch: refetchChangeRequests } =
        usePendingChangeRequests(projectId);
    const { refetchFeature } = useFeature(projectId, featureId);
    const { trackEvent } = usePlausibleTracker();

    const projectDefaultStrategy = project?.environments?.find(
        (env) => env.environment === environmentId,
    )?.defaultStrategy || {
        name: 'flexibleRollout',
        title: '100% of all users',
    };

    const onApply = async () => {
        trackEvent('strategy-add', {
            props: {
                buttonTitle: formatStrategyName(projectDefaultStrategy.name),
            },
        });

        const payload = {
            name: projectDefaultStrategy.name,
            title: projectDefaultStrategy.title ?? '',
            constraints: projectDefaultStrategy.constraints ?? [],
            parameters: projectDefaultStrategy.parameters ?? {},
            variants: projectDefaultStrategy.variants ?? [],
            segments: projectDefaultStrategy.segments ?? [],
            disabled: projectDefaultStrategy.disabled ?? false,
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

        onClose();
    };

    const strategyName = projectDefaultStrategy.name || 'flexibleRollout';
    const strategyDisplayName = 'Default strategy';
    const description =
        projectDefaultStrategy.title ||
        'This is the default strategy defined for this environment in the project';

    return (
        <FeatureStrategyMenuCard
            name={strategyDisplayName}
            description={description}
            icon={<FeatureStrategyMenuCardIcon name='defaultStrategy' />}
            isDefault
        >
            <FeatureStrategyMenuCardAction
                onClick={() =>
                    onConfigure({
                        strategyName,
                        strategyDisplayName,
                        isDefault: true,
                    })
                }
            >
                Configure
            </FeatureStrategyMenuCardAction>
            <FeatureStrategyMenuCardAction onClick={onApply}>
                Apply
            </FeatureStrategyMenuCardAction>
        </FeatureStrategyMenuCard>
    );
};
