import { useState } from 'react';
import { Accordion, AccordionDetails, Box, styled } from '@mui/material';
import type {
    IFeatureEnvironment,
    IFeatureEnvironmentMetrics,
} from 'interfaces/featureToggle';
import { FeatureStrategyMenu } from 'component/feature/FeatureStrategy/FeatureStrategyMenu/FeatureStrategyMenu';
import { FEATURE_ENVIRONMENT_ACCORDION } from 'utils/testIds';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { UpgradeChangeRequests } from './UpgradeChangeRequests/UpgradeChangeRequests.tsx';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import {
    environmentAccordionSummaryClassName,
    EnvironmentHeader,
} from './EnvironmentHeader/EnvironmentHeader.tsx';
import FeatureOverviewEnvironmentMetrics from './EnvironmentHeader/FeatureOverviewEnvironmentMetrics/FeatureOverviewEnvironmentMetrics.tsx';
import { FeatureOverviewEnvironmentToggle } from './EnvironmentHeader/FeatureOverviewEnvironmentToggle/FeatureOverviewEnvironmentToggle.tsx';
import type { IReleasePlan } from 'interfaces/releasePlans';
import { EnvironmentAccordionBody } from './EnvironmentAccordionBody/EnvironmentAccordionBody.tsx';
import type { StrategyFilterValue } from 'component/feature/FeatureStrategy/FeatureStrategyMenu/FeatureStrategyMenuCards/FeatureStrategyMenuCards';
import { FeatureStrategyMenuButton } from 'component/feature/FeatureStrategy/FeatureStrategyMenu/FeatureStrategyMenuButton.tsx';

const StyledFeatureOverviewEnvironment = styled('div')(({ theme }) => ({
    borderRadius: theme.shape.borderRadiusLarge,
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
}));

const StyledAccordion = styled(Accordion)(({ theme }) => ({
    boxShadow: 'none',
    background: 'none',
    borderRadius: theme.shape.borderRadiusLarge,

    [`&:has(.${environmentAccordionSummaryClassName}:focus-visible)`]: {
        background: theme.palette.table.headerHover,
    },
}));

const NewStyledAccordionDetails = styled(AccordionDetails)(({ theme }) => ({
    padding: 0,
    background: theme.palette.background.elevation1,
    borderBottomLeftRadius: theme.shape.borderRadiusLarge,
    borderBottomRightRadius: theme.shape.borderRadiusLarge,
    boxShadow: theme.boxShadows.accordionFooter,
}));

const StyledAccordionFooter = styled('footer')(({ theme }) => ({
    padding: theme.spacing(2, 3, 3),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
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
    onToggleEnvOpen?: (isOpen: boolean) => void;
};

export const FeatureOverviewEnvironment = ({
    environment,
    metrics = { yes: 0, no: 0 },
    otherEnvironments = [],
    onToggleEnvOpen = () => {},
}: FeatureOverviewEnvironmentProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');
    const { isOss, isEnterprise } = useUiConfig();
    const hasActivations = Boolean(
        environment?.enabled ||
            (environment?.strategies && environment?.strategies.length > 0) ||
            (environment?.releasePlans && environment?.releasePlans.length > 0),
    );

    const [filter, setFilter] = useState<StrategyFilterValue>(null);
    const [isStrategyMenuDialogOpen, setIsStrategyMenuDialogOpen] =
        useState<boolean>(false);

    const dialogId = isStrategyMenuDialogOpen
        ? 'FeatureStrategyMenuDialog'
        : undefined;

    const openMoreStrategies = (_event: React.SyntheticEvent) => {
        setFilter(null);
        setIsStrategyMenuDialogOpen(true);
    };

    const onClose = () => {
        setIsStrategyMenuDialogOpen(false);
    };

    return (
        <StyledFeatureOverviewEnvironment>
            <StyledAccordion
                TransitionProps={{ mountOnEnter: true, unmountOnExit: true }}
                data-testid={`${FEATURE_ENVIRONMENT_ACCORDION}_${environment.name}`}
                expanded={isOpen && hasActivations}
                onChange={() => {
                    const state = isOpen ? !isOpen : hasActivations;
                    onToggleEnvOpen(state);
                    setIsOpen(state);
                }}
            >
                <EnvironmentHeader
                    environmentMetadata={{
                        strategyCount: environment.strategies?.length ?? 0,
                        releasePlanCount: environment.releasePlans?.length ?? 0,
                    }}
                    environmentId={environment.name}
                    projectId={projectId}
                    featureId={featureId}
                    expandable={hasActivations}
                    hasActivations={hasActivations}
                    onOpenReleaseTemplates={
                        isEnterprise()
                            ? () => {
                                  setFilter('releaseTemplates');
                                  setIsStrategyMenuDialogOpen(true);
                              }
                            : undefined
                    }
                >
                    <FeatureOverviewEnvironmentToggle
                        environment={environment}
                    />
                    {!hasActivations ? (
                        <>
                            <FeatureStrategyMenuButton
                                label='Add strategy'
                                dialogId={dialogId}
                                projectId={projectId}
                                environmentId={environment.name}
                                onClick={openMoreStrategies}
                                variant='outlined'
                            />
                            <FeatureStrategyMenu
                                projectId={projectId}
                                featureId={featureId}
                                environmentId={environment.name}
                                isStrategyMenuDialogOpen={
                                    isStrategyMenuDialogOpen
                                }
                                onClose={onClose}
                                defaultFilter={filter}
                            />
                        </>
                    ) : (
                        <FeatureOverviewEnvironmentMetrics
                            environmentMetric={metrics}
                        />
                    )}
                </EnvironmentHeader>
                <NewStyledAccordionDetails>
                    <StyledEnvironmentAccordionContainer>
                        <EnvironmentAccordionBody
                            featureEnvironment={environment}
                            isDisabled={!environment.enabled}
                            otherEnvironments={otherEnvironments}
                        />
                    </StyledEnvironmentAccordionContainer>
                    <StyledAccordionFooter>
                        <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                            <Box ml='auto'>
                                <FeatureStrategyMenuButton
                                    label='Add strategy'
                                    dialogId={dialogId}
                                    projectId={projectId}
                                    environmentId={environment.name}
                                    onClick={openMoreStrategies}
                                    variant='outlined'
                                />
                                <FeatureStrategyMenu
                                    projectId={projectId}
                                    featureId={featureId}
                                    environmentId={environment.name}
                                    isStrategyMenuDialogOpen={
                                        isStrategyMenuDialogOpen
                                    }
                                    onClose={onClose}
                                    defaultFilter={filter}
                                />
                            </Box>
                        </Box>
                        {isOss() && environment?.type === 'production' ? (
                            <UpgradeChangeRequests />
                        ) : null}
                    </StyledAccordionFooter>
                </NewStyledAccordionDetails>
            </StyledAccordion>
        </StyledFeatureOverviewEnvironment>
    );
};
