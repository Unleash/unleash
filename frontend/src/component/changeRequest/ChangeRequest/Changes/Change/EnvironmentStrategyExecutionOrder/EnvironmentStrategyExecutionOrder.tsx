import type { IChangeRequestReorderStrategy } from '../../../../changeRequest.types';
import type { ReactNode } from 'react';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import { TooltipLink } from 'component/common/TooltipLink/TooltipLink';
import { Box, styled } from '@mui/material';
import { EnvironmentStrategyOrderDiff } from './EnvironmentStrategyOrderDiff';
import { StrategyExecution } from 'component/feature/FeatureView/FeatureOverview/FeatureOverviewEnvironments/FeatureOverviewEnvironment/EnvironmentAccordionBody/StrategyDraggableItem/StrategyItem/StrategyExecution/StrategyExecution';
import { formatStrategyName } from '../../../../../../utils/strategyNames';

const ChangeItemInfo = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
});

const StyledChangeHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'start',
    marginBottom: theme.spacing(2),
    lineHeight: theme.spacing(3),
}));
const StyledStrategyExecutionWrapper = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    lineHeight: theme.spacing(3),
    gap: theme.spacing(2.5),
    marginBottom: theme.spacing(1),
}));

const StyledStrategyContainer = styled('div')({
    flexDirection: 'row',
    width: '100%',
});

interface IEnvironmentStrategyExecutionOrderProps {
    feature: string;
    project: string;
    environment: string;
    change: IChangeRequestReorderStrategy;
    actions?: ReactNode;
}

export const EnvironmentStrategyExecutionOrder = ({
    feature,
    environment,
    change,
    project,
    actions,
}: IEnvironmentStrategyExecutionOrderProps) => {
    const { feature: featureData, loading } = useFeature(project, feature);

    if (loading) return null;

    const featureEnvironment = featureData.environments.find(
        ({ name }) => environment === name,
    );
    const environmentStrategies = featureEnvironment?.strategies || [];

    const preData = {
        strategyIds:
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
                .map((strategy) => strategy.id) ?? [],
    };

    const updatedStrategies = change.payload
        .map(({ id }) => {
            return environmentStrategies.find((s) => s.id === id);
        })
        .filter(Boolean);

    const data = {
        strategyIds: updatedStrategies.map((strategy) => strategy!.id),
    };

    return (
        <ChangeItemInfo>
            <StyledChangeHeader>
                <TooltipLink
                    tooltip={
                        <EnvironmentStrategyOrderDiff
                            preData={preData}
                            data={data}
                        />
                    }
                    tooltipProps={{
                        maxWidth: 500,
                        maxHeight: 600,
                    }}
                >
                    Updating strategy execution order to:
                </TooltipLink>
                {actions}
            </StyledChangeHeader>
            <StyledStrategyExecutionWrapper>
                {updatedStrategies.map((strategy, index) => (
                    <StyledStrategyContainer>
                        {`${index + 1}: `}
                        {formatStrategyName(strategy?.name || '')}
                        {strategy?.title && ` - ${strategy.title}`}
                        <StrategyExecution strategy={strategy!} />
                    </StyledStrategyContainer>
                ))}
            </StyledStrategyExecutionWrapper>
        </ChangeItemInfo>
    );
};
