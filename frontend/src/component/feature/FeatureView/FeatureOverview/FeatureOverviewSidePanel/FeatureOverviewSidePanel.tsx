import { styled } from '@mui/material';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { FeatureOverviewSidePanelEnvironmentSwitches } from './FeatureOverviewSidePanelEnvironmentSwitches/FeatureOverviewSidePanelEnvironmentSwitches';

const StyledContainer = styled('div')(({ theme }) => ({
    borderRadius: theme.shape.borderRadiusLarge,
    backgroundColor: theme.palette.background.paper,
    display: 'flex',
    flexDirection: 'column',
    padding: '1.5rem',
    maxWidth: '350px',
    minWidth: '350px',
    marginRight: '1rem',
    marginTop: '1rem',
    [theme.breakpoints.down(1000)]: {
        marginBottom: '1rem',
        width: '100%',
        maxWidth: 'none',
        minWidth: 'auto',
    },
}));

const StyledHeader = styled('h3')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1),
    alignItems: 'center',
    fontSize: theme.fontSizes.bodySize,
    margin: 0,
    marginBottom: theme.spacing(3),

    // Make the help icon align with the text.
    '& > :last-child': {
        position: 'relative',
        top: 1,
    },
}));

export const FeatureOverviewSidePanel = () => {
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');
    const { feature } = useFeature(projectId, featureId);

    return (
        <StyledContainer>
            <FeatureOverviewSidePanelEnvironmentSwitches
                header={
                    <StyledHeader data-loading>
                        Enabled in environments ({feature.environments.length})
                        <HelpIcon
                            tooltip="When a feature is switched off in an environment, it will always return false. When switched on, it will return true or false depending on its strategies."
                            placement="top"
                        />
                    </StyledHeader>
                }
                feature={feature}
            />
        </StyledContainer>
    );
};
