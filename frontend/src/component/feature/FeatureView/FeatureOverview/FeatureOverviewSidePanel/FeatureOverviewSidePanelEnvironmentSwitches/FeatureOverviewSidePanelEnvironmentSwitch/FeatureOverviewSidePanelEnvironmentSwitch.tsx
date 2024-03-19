import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import type { IFeatureEnvironment } from 'interfaces/featureToggle';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { styled } from '@mui/material';
import StringTruncator from 'component/common/StringTruncator/StringTruncator';
import { FeatureOverviewSidePanelEnvironmentHider } from './FeatureOverviewSidePanelEnvironmentHider';
import { FeatureToggleSwitch } from 'component/project/Project/ProjectFeatureToggles/FeatureToggleSwitch/FeatureToggleSwitch';
import { useFeatureToggleSwitch } from 'component/project/Project/ProjectFeatureToggles/FeatureToggleSwitch/useFeatureToggleSwitch';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';

const StyledContainer = styled('div')(({ theme }) => ({
    marginLeft: theme.spacing(-1.5),
    '&:not(:last-of-type)': {
        marginBottom: theme.spacing(2),
    },
    display: 'flex',
    alignItems: 'center',
}));

const StyledLabel = styled('label')(() => ({
    display: 'inline-flex',
    alignItems: 'center',
    cursor: 'pointer',
}));

interface IFeatureOverviewSidePanelEnvironmentSwitchProps {
    environment: IFeatureEnvironment;
    callback?: () => void;
    children?: React.ReactNode;
    hiddenEnvironments: Set<String>;
    setHiddenEnvironments: (environment: string) => void;
}

export const FeatureOverviewSidePanelEnvironmentSwitch = ({
    environment,
    callback,
    children,
    hiddenEnvironments,
    setHiddenEnvironments,
}: IFeatureOverviewSidePanelEnvironmentSwitchProps) => {
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');
    const { feature, refetchFeature } = useFeature(projectId, featureId);
    const { isChangeRequestConfigured } = useChangeRequestsEnabled(projectId);

    const defaultContent = (
        <>
            {' '}
            <span data-loading>
                {environment.enabled ? 'enabled' : 'disabled'} in
            </span>
            &nbsp;
            <StringTruncator
                text={environment.name}
                maxWidth='120'
                maxLength={15}
            />
        </>
    );
    const { onToggle: onFeatureToggle, modals: featureToggleModals } =
        useFeatureToggleSwitch(projectId);

    const handleToggle = (newState: boolean, onRollback: () => void) =>
        onFeatureToggle(newState, {
            projectId,
            featureId,
            environmentName: environment.name,
            environmentType: environment.type,
            hasStrategies: environment.strategies.length > 0,
            hasEnabledStrategies: environment.strategies.some(
                (strategy) => !strategy.disabled,
            ),
            isChangeRequestEnabled: isChangeRequestConfigured(environment.name),
            onRollback,
            onSuccess: () => {
                if (callback) callback();
                refetchFeature();
            },
        });

    return (
        <StyledContainer>
            <StyledLabel>
                <FeatureToggleSwitch
                    featureId={feature.name}
                    projectId={projectId}
                    environmentName={environment.name}
                    onToggle={handleToggle}
                    value={environment.enabled}
                />
                {children ?? defaultContent}
            </StyledLabel>
            <FeatureOverviewSidePanelEnvironmentHider
                environment={environment}
                hiddenEnvironments={hiddenEnvironments}
                setHiddenEnvironments={setHiddenEnvironments}
            />
            {featureToggleModals}
        </StyledContainer>
    );
};
