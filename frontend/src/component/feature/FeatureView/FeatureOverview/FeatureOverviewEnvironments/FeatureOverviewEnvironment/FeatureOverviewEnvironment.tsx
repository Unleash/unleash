import { Accordion, AccordionDetails, styled } from '@mui/material';
import type {
    IFeatureEnvironment,
    IFeatureEnvironmentMetrics,
} from 'interfaces/featureToggle';
import { FeatureStrategyMenu } from 'component/feature/FeatureStrategy/FeatureStrategyMenu/FeatureStrategyMenu';
import { FEATURE_ENVIRONMENT_ACCORDION } from 'utils/testIds';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { UpgradeChangeRequests } from './UpgradeChangeRequests/UpgradeChangeRequests';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { EnvironmentHeader } from './EnvironmentHeader/EnvironmentHeader';
import FeatureOverviewEnvironmentMetrics from './EnvironmentHeader/FeatureOverviewEnvironmentMetrics/FeatureOverviewEnvironmentMetrics';
import { FeatureOverviewEnvironmentToggle } from './EnvironmentHeader/FeatureOverviewEnvironmentToggle/FeatureOverviewEnvironmentToggle';
import { useState } from 'react';
import type { IReleasePlan } from 'interfaces/releasePlans';
import { NewEnvironmentAccordionBody } from 'component/feature/FeatureView/FeatureOverview/FeatureOverviewEnvironments/FeatureOverviewEnvironment/EnvironmentAccordionBody/EnvironmentAccordionBody';

const StyledFeatureOverviewEnvironment = styled('div')(({ theme }) => ({
    borderRadius: theme.shape.borderRadiusLarge,
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
}));

const StyledAccordion = styled(Accordion)(({ theme }) => ({
    boxShadow: 'none',
    background: 'none',
    '&&& .MuiAccordionSummary-root': {
        borderRadius: theme.shape.borderRadiusLarge,
        pointerEvents: 'auto',
        opacity: 1,
        backgroundColor: theme.palette.background.paper,
    },
}));

const StyledAccordionDetails = styled(AccordionDetails)(({ theme }) => ({
    padding: 0,
    background: theme.palette.background.elevation1,
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
}));

type FeatureOverviewEnvironmentProps = {
    environment: IFeatureEnvironment & {
        releasePlans?: IReleasePlan[];
    };
    metrics?: Pick<IFeatureEnvironmentMetrics, 'yes' | 'no'>;
    otherEnvironments?: string[];
};

export const FeatureOverviewEnvironment = ({
    environment,
    metrics = { yes: 0, no: 0 },
    otherEnvironments = [],
}: FeatureOverviewEnvironmentProps) => {
    const [isOpen, setIsOopen] = useState(false);
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');
    const { isOss } = useUiConfig();
    const hasActivations = Boolean(
        environment?.enabled ||
            (environment?.strategies && environment?.strategies.length > 0) ||
            (environment?.releasePlans && environment?.releasePlans.length > 0),
    );

    return (
        <StyledFeatureOverviewEnvironment>
            <StyledAccordion
                TransitionProps={{ mountOnEnter: true, unmountOnExit: true }}
                data-testid={`${FEATURE_ENVIRONMENT_ACCORDION}_${environment.name}`}
                expanded={isOpen && hasActivations}
                disabled={!hasActivations}
                onChange={() => setIsOopen(isOpen ? !isOpen : hasActivations)}
            >
                <EnvironmentHeader
                    environmentId={environment.name}
                    expandable={hasActivations}
                >
                    <FeatureOverviewEnvironmentToggle
                        environment={environment}
                    />
                    {!hasActivations ? (
                        <FeatureStrategyMenu
                            label='Add strategy'
                            projectId={projectId}
                            featureId={featureId}
                            environmentId={environment.name}
                            variant='outlined'
                            size='small'
                        />
                    ) : null}
                    <FeatureOverviewEnvironmentMetrics
                        environmentMetric={metrics}
                        collapsed={!hasActivations}
                    />
                </EnvironmentHeader>
                <StyledAccordionDetails>
                    <StyledEnvironmentAccordionContainer>
                        <NewEnvironmentAccordionBody
                            featureEnvironment={environment}
                            isDisabled={!environment.enabled}
                            otherEnvironments={otherEnvironments}
                        />
                    </StyledEnvironmentAccordionContainer>
                    <StyledAccordionFooter>
                        <FeatureStrategyMenu
                            label='Add strategy'
                            projectId={projectId}
                            featureId={featureId}
                            environmentId={environment.name}
                        />
                        {isOss() && environment?.type === 'production' ? (
                            <UpgradeChangeRequests />
                        ) : null}
                    </StyledAccordionFooter>
                </StyledAccordionDetails>
            </StyledAccordion>
        </StyledFeatureOverviewEnvironment>
    );
};
