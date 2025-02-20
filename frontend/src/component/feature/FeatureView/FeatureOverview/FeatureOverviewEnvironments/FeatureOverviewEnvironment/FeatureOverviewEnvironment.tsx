import { Accordion, AccordionDetails, styled } from '@mui/material';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import useFeatureMetrics from 'hooks/api/getters/useFeatureMetrics/useFeatureMetrics';
import type { IFeatureEnvironment } from 'interfaces/featureToggle';
import { getFeatureMetrics } from 'utils/getFeatureMetrics';
import EnvironmentAccordionBody from './EnvironmentAccordionBody/EnvironmentAccordionBody';
import { FeatureStrategyMenu } from 'component/feature/FeatureStrategy/FeatureStrategyMenu/FeatureStrategyMenu';
import { FEATURE_ENVIRONMENT_ACCORDION } from 'utils/testIds';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { UpgradeChangeRequests } from './UpgradeChangeRequests/UpgradeChangeRequests';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { EnvironmentHeader } from './EnvironmentHeader/EnvironmentHeader';
import FeatureOverviewEnvironmentMetrics from './EnvironmentHeader/FeatureOverviewEnvironmentMetrics/FeatureOverviewEnvironmentMetrics';
import { FeatureOverviewEnvironmentToggle } from './EnvironmentHeader/FeatureOverviewEnvironmentToggle/FeatureOverviewEnvironmentToggle';
import { useState } from 'react';
import { useReleasePlans } from 'hooks/api/getters/useReleasePlans/useReleasePlans';

interface IFeatureOverviewEnvironmentProps {
    env: IFeatureEnvironment;
}

const StyledFeatureOverviewEnvironment = styled('div')(({ theme }) => ({
    borderRadius: theme.shape.borderRadiusLarge,
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
}));

const StyledAccordion = styled(Accordion)({
    boxShadow: 'none',
    background: 'none',
});

const StyledAccordionDetails = styled(AccordionDetails)(({ theme }) => ({
    padding: 0,
    background: theme.palette.envAccordion.expanded,
    borderBottomLeftRadius: theme.shape.borderRadiusLarge,
    borderBottomRightRadius: theme.shape.borderRadiusLarge,
    boxShadow: theme.boxShadows.accordionFooter,

    [theme.breakpoints.down('md')]: {
        padding: theme.spacing(2, 1),
    },
}));

const StyledAccordionFooter = styled('footer')(({ theme }) => ({
    padding: theme.spacing(2, 3, 3),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: theme.spacing(2),
    borderTop: `1px solid ${theme.palette.divider}`,
}));

const StyledEnvironmentAccordionContainer = styled('div')(({ theme }) => ({
    width: '100%',
    position: 'relative',
    padding: theme.spacing(3, 3, 1),
}));

export const FeatureOverviewEnvironment = ({
    env,
}: IFeatureOverviewEnvironmentProps) => {
    const [isOpen, setIsOopen] = useState(false);
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');
    const { metrics } = useFeatureMetrics(projectId, featureId);
    const { feature } = useFeature(projectId, featureId);

    const featureMetrics = getFeatureMetrics(feature?.environments, metrics);
    const environmentMetric = featureMetrics.find(
        (featureMetric) => featureMetric.environment === env.name,
    );
    const featureEnvironment = feature?.environments.find(
        (featureEnvironment) => featureEnvironment.name === env.name,
    );
    const { isOss } = useUiConfig();
    const showChangeRequestUpgrade = env.type === 'production' && isOss();
    const { releasePlans } = useReleasePlans(
        projectId,
        featureId,
        featureEnvironment?.name,
    );
    const hasActivations = Boolean(
        env.enabled ||
            (featureEnvironment?.strategies &&
                featureEnvironment?.strategies.length > 0) ||
            (releasePlans && releasePlans.length > 0),
    );

    return (
        <StyledFeatureOverviewEnvironment>
            <StyledAccordion
                TransitionProps={{ mountOnEnter: true }}
                data-testid={`${FEATURE_ENVIRONMENT_ACCORDION}_${env.name}`}
                expanded={isOpen && hasActivations}
                onChange={() => setIsOopen(isOpen ? !isOpen : hasActivations)}
            >
                <EnvironmentHeader
                    environmentId={env.name}
                    expandable={hasActivations}
                >
                    <FeatureOverviewEnvironmentToggle environment={env} />
                    {hasActivations ? (
                        <FeatureOverviewEnvironmentMetrics
                            environmentMetric={environmentMetric}
                            disabled={!env.enabled}
                        />
                    ) : (
                        <FeatureStrategyMenu
                            label='Add strategy'
                            projectId={projectId}
                            featureId={featureId}
                            environmentId={env.name}
                            variant='outlined'
                            size='small'
                        />
                    )}
                </EnvironmentHeader>
                <StyledAccordionDetails>
                    <StyledEnvironmentAccordionContainer>
                        <EnvironmentAccordionBody
                            featureEnvironment={featureEnvironment}
                            isDisabled={!env.enabled}
                            otherEnvironments={feature?.environments
                                .map(({ name }) => name)
                                .filter((name) => name !== env.name)}
                        />
                    </StyledEnvironmentAccordionContainer>
                    <StyledAccordionFooter>
                        <FeatureStrategyMenu
                            label='Add strategy'
                            projectId={projectId}
                            featureId={featureId}
                            environmentId={env.name}
                        />
                        {showChangeRequestUpgrade ? (
                            <UpgradeChangeRequests />
                        ) : null}
                    </StyledAccordionFooter>
                </StyledAccordionDetails>
            </StyledAccordion>
        </StyledFeatureOverviewEnvironment>
    );
};
