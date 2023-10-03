import { Divider, styled } from '@mui/material';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { FeatureOverviewSidePanelDetails } from './FeatureOverviewSidePanelDetails/FeatureOverviewSidePanelDetails';
import { FeatureOverviewSidePanelEnvironmentSwitches } from './FeatureOverviewSidePanelEnvironmentSwitches/FeatureOverviewSidePanelEnvironmentSwitches';
import { FeatureOverviewSidePanelTags } from './FeatureOverviewSidePanelTags/FeatureOverviewSidePanelTags';

const StyledContainer = styled('div')(({ theme }) => ({
    position: 'sticky',
    top: theme.spacing(2),
    borderRadius: theme.shape.borderRadiusLarge,
    backgroundColor: theme.palette.background.paper,
    display: 'flex',
    flexDirection: 'column',
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

interface IFeatureOverviewSidePanelProps {
    hiddenEnvironments: Set<String>;
    setHiddenEnvironments: (environment: string) => void;
}

export const FeatureOverviewSidePanel = ({
    hiddenEnvironments,
    setHiddenEnvironments,
}: IFeatureOverviewSidePanelProps) => {
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');
    const { feature } = useFeature(projectId, featureId);

    return (
        <StyledContainer>
            <FeatureOverviewSidePanelEnvironmentSwitches
                header={
                    <StyledHeader data-loading>
                        Enabled in environments (
                        {
                            feature.environments.filter(
                                ({ enabled }) => enabled
                            ).length
                        }
                        )
                        <HelpIcon
                            tooltip="When a feature is switched off in an environment, it will always return false. When switched on, it will return true or false depending on its strategies."
                            placement="top"
                        />
                    </StyledHeader>
                }
                feature={feature}
                hiddenEnvironments={hiddenEnvironments}
                setHiddenEnvironments={setHiddenEnvironments}
            />
            <Divider />
            <FeatureOverviewSidePanelDetails
                header={
                    <StyledHeader data-loading>
                        Feature toggle details
                    </StyledHeader>
                }
                feature={feature}
            />
            <Divider />
            <FeatureOverviewSidePanelTags
                header={
                    <StyledHeader data-loading>
                        Tags for this feature toggle
                    </StyledHeader>
                }
                feature={feature}
            />
        </StyledContainer>
    );
};
