import { IChangeRequestUpdateEnvironmentStrategyExecutionOrder } from '../../../../changeRequest.types';
import { ReactNode } from 'react';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import { TooltipLink } from 'component/common/TooltipLink/TooltipLink';
import { Box, styled } from '@mui/material';
import { EnvironmentStrategyOrderDiff } from './EnvironmentStrategyOrderDiff';
import { StrategyExecution } from 'component/feature/FeatureView/FeatureOverview/FeatureOverviewEnvironments/FeatureOverviewEnvironment/EnvironmentAccordionBody/StrategyDraggableItem/StrategyItem/StrategyExecution/StrategyExecution';

const ChangeItemInfo = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
});

const StyledChangeHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'column',
    alignItems: 'start',
    marginBottom: theme.spacing(2),
    lineHeight: theme.spacing(3),
}));
const StyledStrategyExecutionWrapper = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(2),
    lineHeight: theme.spacing(3),
    gap: theme.spacing(1),
}));

interface IEnvironmentStrategyExecutionOrderProps {
    feature: string;
    project: string;
    environment: string;
    change: IChangeRequestUpdateEnvironmentStrategyExecutionOrder;
    discard?: ReactNode;
}

export const EnvironmentStrategyExecutionOrder = ({
    feature,
    environment,
    change,
    project,
    discard,
}: IEnvironmentStrategyExecutionOrderProps) => {
    const { feature: featureData } = useFeature(project, feature);
    const featureEnvironment = featureData.environments.find(
        ({ name }) => environment === name
    );
    const environmentStrategies = featureEnvironment?.strategies || [];

    const preData =
        environmentStrategies
            .sort((strategy1, strategy2) => {
                if (
                    typeof strategy1.sortOrder === 'number' &&
                    typeof strategy2.sortOrder === 'number'
                ) {
                    return strategy1.sortOrder - strategy2.sortOrder;
                }
                return 0;
            })
            .map(strategy => strategy.id) ?? [];

    const updatedStategies = change.payload.map(({ id }) => {
        return environmentStrategies.find(s => s.id === id);
    });

    return (
        <ChangeItemInfo>
            <StyledChangeHeader>
                <TooltipLink
                    tooltip={
                        <EnvironmentStrategyOrderDiff
                            preData={preData}
                            data={updatedStategies.map(
                                strategy => strategy!.id
                            )}
                        />
                    }
                    tooltipProps={{
                        maxWidth: 500,
                        maxHeight: 600,
                    }}
                >
                    Updating strategy execution order to:
                </TooltipLink>
                <StyledStrategyExecutionWrapper>
                    {updatedStategies.map(strategy => (
                        <StrategyExecution strategy={strategy!} />
                    ))}
                </StyledStrategyExecutionWrapper>
                {discard}
            </StyledChangeHeader>
        </ChangeItemInfo>
    );
};
