import { useFeatureToggleSwitch } from 'component/project/Project/ProjectFeatureToggles/FeatureToggleSwitch/useFeatureToggleSwitch';
import { FeatureToggleSwitch } from 'component/project/Project/ProjectFeatureToggles/FeatureToggleSwitch/FeatureToggleSwitch';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import type { IFeatureEnvironment } from 'interfaces/featureToggle';

interface IFeatureOverviewEnvironmentToggleProps {
    environment: IFeatureEnvironment;
}

export const FeatureOverviewEnvironmentToggle = ({
    environment: { name, type, strategies, enabled },
}: IFeatureOverviewEnvironmentToggleProps) => {
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');
    const { refetchFeature } = useFeature(projectId, featureId);

    const { isChangeRequestConfigured } = useChangeRequestsEnabled(projectId);

    const { onToggle: onFeatureToggle, modals: featureToggleModals } =
        useFeatureToggleSwitch(projectId);

    const onToggle = (newState: boolean, onRollback: () => void) =>
        onFeatureToggle(newState, {
            projectId,
            featureId,
            environmentName: name,
            environmentType: type,
            hasStrategies: strategies.length > 0,
            hasEnabledStrategies: strategies.some(
                (strategy) => !strategy.disabled,
            ),
            isChangeRequestEnabled: isChangeRequestConfigured(name),
            onRollback,
            onSuccess: refetchFeature,
        });

    return (
        <>
            <FeatureToggleSwitch
                projectId={projectId}
                value={enabled}
                featureId={featureId}
                environmentName={name}
                onToggle={onToggle}
            />
            {featureToggleModals}
        </>
    );
};
