import type { IChangeRequestReorderStrategy } from '../../../../changeRequest.types';
import type { ReactNode } from 'react';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import { TooltipLink } from 'component/common/TooltipLink/TooltipLink';
import { Box, styled } from '@mui/material';
import { EnvironmentStrategyOrderDiff } from './EnvironmentStrategyOrderDiff.tsx';
import { StrategyExecution } from 'component/feature/FeatureView/FeatureOverview/FeatureOverviewEnvironments/FeatureOverviewEnvironment/EnvironmentAccordionBody/StrategyDraggableItem/StrategyItem/StrategyExecution/StrategyExecution';
import { formatStrategyName } from '../../../../../../utils/strategyNames.tsx';
import type { IFeatureStrategy } from 'interfaces/strategy.ts';
import { Tab, TabList, TabPanel, Tabs } from '../ChangeTabComponents.tsx';
import { useUiFlag } from 'hooks/useUiFlag.ts';

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
    const useDiffableComponent = useUiFlag('crDiffView');

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

    const updatedStrategies: IFeatureStrategy[] = change.payload
        .map(({ id }) => {
            return environmentStrategies.find((s) => s.id === id);
        })
        .filter((strategy): strategy is IFeatureStrategy => Boolean(strategy));

    const data = {
        strategyIds: updatedStrategies.map((strategy) => strategy.id),
    };

    if (useDiffableComponent) {
        return (
            <Tabs>
                <ChangeItemInfo>
                    <StyledChangeHeader>
                        <p>Updating strategy execution order to:</p>
                        <div>
                            <TabList>
                                <Tab>Change</Tab>
                                <Tab>View diff</Tab>
                            </TabList>
                            {actions}
                        </div>
                    </StyledChangeHeader>
                    <TabPanel>
                        <StyledStrategyExecutionWrapper>
                            {updatedStrategies.map((strategy, index) => (
                                <StyledStrategyContainer key={strategy.id}>
                                    {`${index + 1}: `}
                                    {formatStrategyName(strategy?.name || '')}
                                    {strategy?.title && ` - ${strategy.title}`}
                                    <StrategyExecution strategy={strategy!} />
                                </StyledStrategyContainer>
                            ))}
                        </StyledStrategyExecutionWrapper>
                    </TabPanel>
                    <TabPanel>
                        <EnvironmentStrategyOrderDiff
                            preData={preData}
                            data={data}
                        />
                    </TabPanel>
                </ChangeItemInfo>
            </Tabs>
        );
    }

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
                    <StyledStrategyContainer key={strategy.id}>
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
