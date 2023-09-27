import { IFeatureToggle } from 'interfaces/featureToggle';
import { Button, styled, Box } from '@mui/material';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { formatDateYMD } from 'utils/formatDate';
import { parseISO } from 'date-fns';
import { FeatureEnvironmentSeen } from '../../../FeatureEnvironmentSeen/FeatureEnvironmentSeen';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { Add } from '@mui/icons-material';
import { useUiFlag } from 'hooks/useUiFlag';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { AddDependencyDialogue } from 'component/feature/Dependencies/AddDependencyDialogue';
import { useState } from 'react';

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    justifyItems: 'center',
    padding: theme.spacing(3),
    fontSize: theme.fontSizes.smallBody,
}));

const StyledLabel = styled('span')(({ theme }) => ({
    color: theme.palette.text.secondary,
    marginRight: theme.spacing(1),
}));

interface IFeatureOverviewSidePanelDetailsProps {
    feature: IFeatureToggle;
    header: React.ReactNode;
}

const FlexRow = styled('div')({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
});

const StyledDetail = styled('div')(({ theme }) => ({
    justifyContent: 'center',
    paddingTop: theme.spacing(0.75),
}));

export const FeatureOverviewSidePanelDetails = ({
    feature,
    header,
}: IFeatureOverviewSidePanelDetailsProps) => {
    const { locationSettings } = useLocationSettings();
    const { uiConfig } = useUiConfig();
    const dependentFeatures = useUiFlag('dependentFeatures');

    const showLastSeenByEnvironment = Boolean(
        uiConfig.flags.lastSeenByEnvironment
    );

    const [showDependencyDialogue, setShowDependencyDialogue] = useState(false);

    return (
        <StyledContainer>
            {header}
            <FlexRow>
                <StyledDetail>
                    <StyledLabel>Created at:</StyledLabel>
                    <span>
                        {formatDateYMD(
                            parseISO(feature.createdAt),
                            locationSettings.locale
                        )}
                    </span>
                </StyledDetail>
                {showLastSeenByEnvironment && (
                    <FeatureEnvironmentSeen
                        featureLastSeen={feature.lastSeenAt}
                        environments={feature.environments}
                        sx={{ pt: 0 }}
                    />
                )}
            </FlexRow>
            <ConditionallyRender
                condition={dependentFeatures && Boolean(feature.project)}
                show={
                    <FlexRow>
                        <StyledDetail>
                            <StyledLabel>Dependency:</StyledLabel>
                            <Button
                                startIcon={<Add />}
                                onClick={() => {
                                    setShowDependencyDialogue(true);
                                }}
                            >
                                Add parent feature
                            </Button>
                        </StyledDetail>
                    </FlexRow>
                }
            />
            <ConditionallyRender
                condition={dependentFeatures && Boolean(feature.project)}
                show={
                    <AddDependencyDialogue
                        project={feature.project}
                        featureId={feature.name}
                        onClose={() => setShowDependencyDialogue(false)}
                        showDependencyDialogue={
                            dependentFeatures && showDependencyDialogue
                        }
                    />
                }
            />
        </StyledContainer>
    );
};
