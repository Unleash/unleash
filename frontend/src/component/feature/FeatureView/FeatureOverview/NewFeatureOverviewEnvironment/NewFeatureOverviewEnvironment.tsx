import { Box, styled } from '@mui/material';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import useFeatureMetrics from 'hooks/api/getters/useFeatureMetrics/useFeatureMetrics';
import { getFeatureMetrics } from 'utils/getFeatureMetrics';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { FeatureOverviewEnvironmentBody } from './FeatureOverviewEnvironmentBody';
import FeatureOverviewEnvironmentMetrics from '../FeatureOverviewEnvironments/FeatureOverviewEnvironment/FeatureOverviewEnvironmentMetrics/FeatureOverviewEnvironmentMetrics';
import { FeatureStrategyMenu } from 'component/feature/FeatureStrategy/FeatureStrategyMenu/FeatureStrategyMenu';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { FeatureOverviewEnvironmentToggle } from './FeatureOverviewEnvironmentToggle';

const StyledFeatureOverviewEnvironment = styled('div')(({ theme }) => ({
    padding: theme.spacing(1, 3),
    borderRadius: theme.shape.borderRadiusLarge,
    backgroundColor: theme.palette.background.paper,
}));

const StyledFeatureOverviewEnvironmentBody = styled(
    FeatureOverviewEnvironmentBody,
)(({ theme }) => ({
    width: '100%',
    position: 'relative',
    paddingBottom: theme.spacing(2),
}));

const StyledHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    marginBottom: theme.spacing(2),
}));

const StyledHeaderToggleContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

const StyledHeaderTitleContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
}));

const StyledHeaderTitleLabel = styled('span')(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    lineHeight: 0.5,
    color: theme.palette.text.secondary,
}));

const StyledHeaderTitle = styled('span')(({ theme }) => ({
    fontSize: theme.fontSizes.mainHeader,
    fontWeight: theme.typography.fontWeightBold,
}));

interface INewFeatureOverviewEnvironmentProps {
    environmentId: string;
}

export const NewFeatureOverviewEnvironment = ({
    environmentId,
}: INewFeatureOverviewEnvironmentProps) => {
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');
    const { metrics } = useFeatureMetrics(projectId, featureId);
    const { feature } = useFeature(projectId, featureId);

    const featureMetrics = getFeatureMetrics(feature?.environments, metrics);
    const environmentMetric = featureMetrics.find(
        ({ environment }) => environment === environmentId,
    );
    const featureEnvironment = feature?.environments.find(
        ({ name }) => name === environmentId,
    );

    if (!featureEnvironment)
        return (
            <StyledFeatureOverviewEnvironment className='skeleton'>
                <Box sx={{ height: '400px' }} />
            </StyledFeatureOverviewEnvironment>
        );

    return (
        <StyledFeatureOverviewEnvironment>
            <StyledHeader data-loading>
                <StyledHeaderToggleContainer>
                    <FeatureOverviewEnvironmentToggle
                        environment={featureEnvironment}
                    />
                    <StyledHeaderTitleContainer>
                        <StyledHeaderTitleLabel>
                            Environment
                        </StyledHeaderTitleLabel>
                        <StyledHeaderTitle>{environmentId}</StyledHeaderTitle>
                    </StyledHeaderTitleContainer>
                </StyledHeaderToggleContainer>
                <FeatureOverviewEnvironmentMetrics
                    environmentMetric={environmentMetric}
                    disabled={!featureEnvironment.enabled}
                />
            </StyledHeader>

            <StyledFeatureOverviewEnvironmentBody
                featureEnvironment={featureEnvironment}
                isDisabled={!featureEnvironment.enabled}
                otherEnvironments={feature?.environments
                    .map(({ name }) => name)
                    .filter((name) => name !== environmentId)}
            />
            <ConditionallyRender
                condition={(featureEnvironment?.strategies?.length || 0) > 0}
                show={
                    <>
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                py: 1,
                            }}
                        >
                            <FeatureStrategyMenu
                                label='Add strategy'
                                projectId={projectId}
                                featureId={featureId}
                                environmentId={environmentId}
                            />
                        </Box>
                    </>
                }
            />
        </StyledFeatureOverviewEnvironment>
    );
};
