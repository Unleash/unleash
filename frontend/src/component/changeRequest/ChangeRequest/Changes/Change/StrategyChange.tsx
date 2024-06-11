import type React from 'react';
import type { VFC, FC, ReactNode } from 'react';
import { Box, styled, Tooltip, Typography } from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import {
    StrategyDiff,
    StrategyTooltipLink,
} from '../../StrategyTooltipLink/StrategyTooltipLink';
import { StrategyExecution } from 'component/feature/FeatureView/FeatureOverview/FeatureOverviewEnvironments/FeatureOverviewEnvironment/EnvironmentAccordionBody/StrategyDraggableItem/StrategyItem/StrategyExecution/StrategyExecution';
import type {
    ChangeRequestState,
    IChangeRequestAddStrategy,
    IChangeRequestDeleteStrategy,
    IChangeRequestUpdateStrategy,
} from 'component/changeRequest/changeRequest.types';
import { useCurrentStrategy } from './hooks/useCurrentStrategy';
import { Badge } from 'component/common/Badge/Badge';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { flexRow } from 'themes/themeStyles';
import { EnvironmentVariantsTable } from 'component/feature/FeatureView/FeatureVariants/FeatureEnvironmentVariants/EnvironmentVariantsCard/EnvironmentVariantsTable/EnvironmentVariantsTable';
import { ChangeOverwriteWarning } from './ChangeOverwriteWarning/ChangeOverwriteWarning';

export const ChangeItemWrapper = styled(Box)({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
});

const ChangeItemCreateEditDeleteWrapper = styled(Box)(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: 'auto auto',
    justifyContent: 'space-between',
    gap: theme.spacing(1),
    alignItems: 'center',
    marginBottom: theme.spacing(2),
    width: '100%',
}));

const ChangeItemInfo: FC<{ children?: React.ReactNode }> = styled(Box)(
    ({ theme }) => ({
        display: 'grid',
        gridTemplateColumns: '150px auto',
        gridAutoFlow: 'column',
        alignItems: 'center',
        flexGrow: 1,
        gap: theme.spacing(1),
    }),
);

const StyledBox: FC<{ children?: React.ReactNode }> = styled(Box)(
    ({ theme }) => ({
        marginTop: theme.spacing(2),
    }),
);

const StyledTypography: FC<{ children?: React.ReactNode }> = styled(Typography)(
    ({ theme }) => ({
        margin: `${theme.spacing(1)} 0`,
    }),
);

const hasNameField = (payload: unknown): payload is { name: string } =>
    typeof payload === 'object' && payload !== null && 'name' in payload;

const DisabledEnabledState: VFC<{ show?: boolean; disabled: boolean }> = ({
    show = true,
    disabled,
}) => {
    if (!show) {
        return null;
    }

    if (disabled) {
        return (
            <Tooltip
                title='This strategy will not be taken into account when evaluating feature flag.'
                arrow
                sx={{ cursor: 'pointer' }}
            >
                <Badge color='disabled' icon={<BlockIcon />}>
                    Disabled
                </Badge>
            </Tooltip>
        );
    }

    return (
        <Tooltip
            title='This was disabled before and with this change it will be taken into account when evaluating feature flag.'
            arrow
            sx={{ cursor: 'pointer' }}
        >
            <Badge color='success' icon={<TrackChangesIcon />}>
                Enabled
            </Badge>
        </Tooltip>
    );
};

const EditHeader: VFC<{
    wasDisabled?: boolean;
    willBeDisabled?: boolean;
}> = ({ wasDisabled = false, willBeDisabled = false }) => {
    if (wasDisabled && willBeDisabled) {
        return (
            <Typography color='action.disabled'>Editing strategy:</Typography>
        );
    }

    if (!wasDisabled && willBeDisabled) {
        return <Typography color='error.dark'>Editing strategy:</Typography>;
    }

    if (wasDisabled && !willBeDisabled) {
        return <Typography color='success.dark'>Editing strategy:</Typography>;
    }

    return <Typography>Editing strategy:</Typography>;
};

export const StrategyChange: VFC<{
    actions?: ReactNode;
    change:
        | IChangeRequestAddStrategy
        | IChangeRequestDeleteStrategy
        | IChangeRequestUpdateStrategy;
    environmentName: string;
    featureName: string;
    projectId: string;
    changeRequestState: ChangeRequestState;
}> = ({
    actions,
    change,
    featureName,
    environmentName,
    projectId,
    changeRequestState,
}) => {
    const currentStrategy = useCurrentStrategy(
        change,
        projectId,
        featureName,
        environmentName,
    );

    const hasDiff = (object: unknown, objectToCompare: unknown) =>
        JSON.stringify(object) !== JSON.stringify(objectToCompare);

    const isStrategyAction =
        change.action === 'addStrategy' || change.action === 'updateStrategy';

    const hasVariantDiff =
        isStrategyAction &&
        hasDiff(currentStrategy?.variants || [], change.payload.variants || []);

    return (
        <>
            {change.action === 'addStrategy' && (
                <>
                    <ChangeItemCreateEditDeleteWrapper>
                        <ChangeItemInfo>
                            <Typography
                                color={
                                    change.payload?.disabled
                                        ? 'action.disabled'
                                        : 'success.dark'
                                }
                            >
                                + Adding strategy:
                            </Typography>
                            <StrategyTooltipLink change={change}>
                                <StrategyDiff
                                    change={change}
                                    currentStrategy={currentStrategy}
                                />
                            </StrategyTooltipLink>
                            <div>
                                <DisabledEnabledState
                                    disabled
                                    show={change.payload?.disabled === true}
                                />
                            </div>
                        </ChangeItemInfo>
                        <div>{actions}</div>
                    </ChangeItemCreateEditDeleteWrapper>
                    <StrategyExecution strategy={change.payload} />
                    <ConditionallyRender
                        condition={hasVariantDiff}
                        show={
                            change.payload.variants && (
                                <StyledBox>
                                    <StyledTypography>
                                        Updating feature variants to:
                                    </StyledTypography>
                                    <EnvironmentVariantsTable
                                        variants={change.payload.variants}
                                    />
                                </StyledBox>
                            )
                        }
                    />
                </>
            )}
            {change.action === 'deleteStrategy' && (
                <>
                    <ChangeItemCreateEditDeleteWrapper className='delete-strategy-information-wrapper'>
                        <ChangeItemInfo>
                            <Typography
                                sx={(theme) => ({
                                    color: theme.palette.error.main,
                                })}
                            >
                                - Deleting strategy:
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
                        <div>{actions}</div>
                    </ChangeItemCreateEditDeleteWrapper>
                    <ConditionallyRender
                        condition={Boolean(currentStrategy)}
                        show={
                            <Typography>
                                {
                                    <StrategyExecution
                                        strategy={currentStrategy!}
                                    />
                                }
                            </Typography>
                        }
                    />
                </>
            )}
            {change.action === 'updateStrategy' && (
                <>
                    <ChangeOverwriteWarning
                        data={{
                            current: currentStrategy,
                            change,
                            changeType: 'strategy',
                        }}
                        changeRequestState={changeRequestState}
                    />
                    <ChangeItemCreateEditDeleteWrapper>
                        <ChangeItemInfo>
                            <EditHeader
                                wasDisabled={currentStrategy?.disabled}
                                willBeDisabled={change.payload?.disabled}
                            />
                            <StrategyTooltipLink
                                change={change}
                                previousTitle={currentStrategy?.title}
                            >
                                <StrategyDiff
                                    change={change}
                                    currentStrategy={currentStrategy}
                                />
                            </StrategyTooltipLink>
                        </ChangeItemInfo>
                        <div>{actions}</div>
                    </ChangeItemCreateEditDeleteWrapper>
                    <ConditionallyRender
                        condition={
                            change.payload?.disabled !==
                            currentStrategy?.disabled
                        }
                        show={
                            <Typography
                                sx={{
                                    marginTop: (theme) => theme.spacing(2),
                                    marginBottom: (theme) => theme.spacing(2),
                                    ...flexRow,
                                    gap: (theme) => theme.spacing(1),
                                }}
                            >
                                This strategy will be{' '}
                                <DisabledEnabledState
                                    disabled={change.payload?.disabled || false}
                                />
                            </Typography>
                        }
                    />
                    <StrategyExecution strategy={change.payload} />
                    <ConditionallyRender
                        condition={Boolean(hasVariantDiff)}
                        show={
                            <StyledBox>
                                <StyledTypography>
                                    Updating feature variants to:
                                </StyledTypography>
                                <EnvironmentVariantsTable
                                    variants={change.payload.variants || []}
                                />
                            </StyledBox>
                        }
                    />
                </>
            )}
        </>
    );
};
