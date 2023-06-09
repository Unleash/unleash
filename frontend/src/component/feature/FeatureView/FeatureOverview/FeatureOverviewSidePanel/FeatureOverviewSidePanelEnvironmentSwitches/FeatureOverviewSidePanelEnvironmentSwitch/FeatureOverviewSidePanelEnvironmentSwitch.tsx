import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import { IFeatureEnvironment } from 'interfaces/featureToggle';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { styled } from '@mui/material';
import StringTruncator from 'component/common/StringTruncator/StringTruncator';
import { FeatureOverviewSidePanelEnvironmentHider } from './FeatureOverviewSidePanelEnvironmentHider';
import { FeatureToggleSwitch } from 'component/project/Project/ProjectFeatureToggles/FeatureToggleSwitch/FeatureToggleSwitch';

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
    showInfoBox: () => void;
    children?: React.ReactNode;
    hiddenEnvironments: Set<String>;
    setHiddenEnvironments: (environment: string) => void;
}

export const FeatureOverviewSidePanelEnvironmentSwitch = ({
    environment,
    callback,
    showInfoBox,
    children,
    hiddenEnvironments,
    setHiddenEnvironments,
}: IFeatureOverviewSidePanelEnvironmentSwitchProps) => {
    const { name, enabled } = environment;

    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');
    const { feature, refetchFeature } = useFeature(projectId, featureId);

    const defaultContent = (
        <>
            {' '}
            <span data-loading>{enabled ? 'enabled' : 'disabled'} in</span>
            &nbsp;
            <StringTruncator text={name} maxWidth="120" maxLength={15} />
        </>
    );

    const handleToggle = () => {
        refetchFeature();
        if (callback) callback();
    };

    return (
        <StyledContainer>
            <StyledLabel>
                <FeatureToggleSwitch
                    featureId={feature.name}
                    projectId={projectId}
                    environmentName={environment.name}
                    onToggle={handleToggle}
                    onError={showInfoBox}
                    value={enabled}
                />
                {children ?? defaultContent}
            </StyledLabel>
            <FeatureOverviewSidePanelEnvironmentHider
                environment={environment}
                hiddenEnvironments={hiddenEnvironments}
                setHiddenEnvironments={setHiddenEnvironments}
            />
        </StyledContainer>
    );
};
