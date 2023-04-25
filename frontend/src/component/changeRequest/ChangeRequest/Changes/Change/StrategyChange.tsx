import { Box, styled, Typography } from '@mui/material';
import { VFC, FC, ReactNode } from 'react';
import {
    StrategyDiff,
    StrategyTooltipLink,
} from '../../StrategyTooltipLink/StrategyTooltipLink';
import { StrategyExecution } from 'component/feature/FeatureView/FeatureOverview/FeatureOverviewEnvironments/FeatureOverviewEnvironment/EnvironmentAccordionBody/StrategyDraggableItem/StrategyItem/StrategyExecution/StrategyExecution';
import {
    IChangeRequestAddStrategy,
    IChangeRequestDeleteStrategy,
    IChangeRequestUpdateStrategy,
} from 'component/changeRequest/changeRequest.types';
import { useCurrentStrategy } from './hooks/useCurrentStrategy';

export const ChangeItemWrapper = styled(Box)({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
});

const ChangeItemCreateEditWrapper = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
}));

const ChangeItemInfo: FC = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

const hasNameField = (payload: unknown): payload is { name: string } =>
    typeof payload === 'object' && payload !== null && 'name' in payload;

export const StrategyChange: VFC<{
    discard?: ReactNode;
    change:
        | IChangeRequestAddStrategy
        | IChangeRequestDeleteStrategy
        | IChangeRequestUpdateStrategy;
    environmentName: string;
    featureName: string;
    projectId: string;
}> = ({ discard, change, featureName, environmentName, projectId }) => {
    const currentStrategy = useCurrentStrategy(
        change,
        projectId,
        featureName,
        environmentName
    );

    return (
        <>
            {change.action === 'addStrategy' && (
                <>
                    <ChangeItemCreateEditWrapper>
                        <ChangeItemInfo>
                            <Typography
                                sx={theme => ({
                                    color: theme.palette.success.dark,
                                })}
                            >
                                + Adding strategy:
                            </Typography>
                            <StrategyTooltipLink change={change}>
                                <StrategyDiff
                                    change={change}
                                    currentStrategy={currentStrategy}
                                />
                            </StrategyTooltipLink>
                        </ChangeItemInfo>
                        {discard}
                    </ChangeItemCreateEditWrapper>
                    <StrategyExecution strategy={change.payload} />
                </>
            )}
            {change.action === 'deleteStrategy' && (
                <ChangeItemWrapper>
                    <ChangeItemInfo>
                        <Typography
                            sx={theme => ({ color: theme.palette.error.main })}
                        >
                            - Deleting strategy
                        </Typography>
                        {hasNameField(change.payload) && (
                            <StrategyTooltipLink change={change}>
                                <StrategyDiff
                                    change={change}
                                    currentStrategy={currentStrategy}
                                />
                            </StrategyTooltipLink>
                        )}
                    </ChangeItemInfo>
                    {discard}
                </ChangeItemWrapper>
            )}
            {change.action === 'updateStrategy' && (
                <>
                    <ChangeItemCreateEditWrapper>
                        <ChangeItemInfo>
                            <Typography>Editing strategy:</Typography>
                            <StrategyTooltipLink change={change}>
                                <StrategyDiff
                                    change={change}
                                    currentStrategy={currentStrategy}
                                />
                            </StrategyTooltipLink>
                        </ChangeItemInfo>
                        {discard}
                    </ChangeItemCreateEditWrapper>
                    <StrategyExecution strategy={change.payload} />
                </>
            )}
        </>
    );
};
