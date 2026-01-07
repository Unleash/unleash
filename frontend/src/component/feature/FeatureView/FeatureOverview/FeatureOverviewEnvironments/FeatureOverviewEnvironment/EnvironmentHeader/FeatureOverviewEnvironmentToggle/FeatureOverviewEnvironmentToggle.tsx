import { styled } from '@mui/material';
import { useFeatureToggleSwitch } from 'component/project/Project/ProjectFeatureToggles/FeatureToggleSwitch/useFeatureToggleSwitch';
import { FeatureToggleSwitch } from 'component/project/Project/ProjectFeatureToggles/FeatureToggleSwitch/FeatureToggleSwitch';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import type { IFeatureEnvironment } from 'interfaces/featureToggle';

const StyledContainer = styled('div')(({ theme }) => ({
    order: -1,
    flex: 0,
}));

type FeatureOverviewEnvironmentToggleProps = {
    environment: Pick<
        IFeatureEnvironment,
        'name' | 'type' | 'strategies' | 'enabled'
    >;
};

export const FeatureOverviewEnvironmentToggle = ({
    environment: { name, type, strategies, enabled },
}: FeatureOverviewEnvironmentToggleProps) => {
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');
    const { feature, refetchFeature } = useFeature(projectId, featureId);

    const { isChangeRequestConfigured } = useChangeRequestsEnabled(projectId);

    const { onToggle: onFeatureToggle, modals: featureToggleModals } =
        useFeatureToggleSwitch(projectId);

    const hasReleasePlans = Boolean(
        feature.environments.find((env) => env.name === name)?.releasePlans
            ?.length,
    );

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
            hasReleasePlans,
            isChangeRequestEnabled: isChangeRequestConfigured(name),
            onRollback,
            onSuccess: refetchFeature,
        });

    return (
        <StyledContainer onClick={(event) => event.stopPropagation()}>
            <FeatureToggleSwitch
                projectId={projectId}
                value={enabled}
                featureId={featureId}
                environmentName={name}
                onToggle={onToggle}
            />
            {featureToggleModals}
        </StyledContainer>
    );
};
