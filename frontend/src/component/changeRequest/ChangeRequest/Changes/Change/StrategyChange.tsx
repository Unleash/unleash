import { VFC, FC, ReactNode } from 'react';
import { Box, styled, Tooltip, Typography } from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
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
import { Badge } from 'component/common/Badge/Badge';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { flexRow } from 'themes/themeStyles';
import { EnvironmentVariantsTable } from 'component/feature/FeatureView/FeatureVariants/FeatureEnvironmentVariants/EnvironmentVariantsCard/EnvironmentVariantsTable/EnvironmentVariantsTable';
import { useUiFlag } from 'hooks/useUiFlag';
import { IFeatureStrategy } from 'interfaces/strategy';
import isEqual from 'lodash.isequal';

export const ChangeItemWrapper = styled(Box)({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
});

const ChangeItemCreateEditWrapper = styled(Box)(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: 'auto auto',
    justifyContent: 'space-between',
    gap: theme.spacing(1),
    alignItems: 'center',
    marginBottom: theme.spacing(2),
    width: '100%',
}));

const ChangeItemInfo: FC = styled(Box)(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: '150px auto',
    gridAutoFlow: 'column',
    alignItems: 'center',
    flexGrow: 1,
    gap: theme.spacing(1),
}));

const StyledBox: FC = styled(Box)(({ theme }) => ({
    marginTop: theme.spacing(2),
}));

const StyledTypography: FC = styled(Typography)(({ theme }) => ({
    margin: `${theme.spacing(1)} 0`,
}));

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
                title='This strategy will not be taken into account when evaluating feature toggle.'
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
            title='This was disabled before and with this change it will be taken into account when evaluating feature toggle.'
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

const hasDiff = (object: unknown, objectToCompare: unknown) =>
    JSON.stringify(object) !== JSON.stringify(objectToCompare);

type DataToOverwrite<Prop extends keyof IFeatureStrategy> = {
    property: Prop;
    oldValue: IFeatureStrategy[Prop];
    newValue: IFeatureStrategy[Prop];
};
type ChangesThatWouldBeOverwritten = DataToOverwrite<keyof IFeatureStrategy>[];

export const getChangesThatWouldBeOverwritten = ({
    currentStrategyConfig,
    change,
}: {
    currentStrategyConfig?: IFeatureStrategy;
    change: IChangeRequestUpdateStrategy;
}): ChangesThatWouldBeOverwritten | null => {
    if (change.payload.snapshot && currentStrategyConfig) {
        const hasChanged = (a: unknown, b: unknown) => {
            if (typeof a === 'object') {
                return !isEqual(a, b);
            }
            return hasDiff(a, b);
        };

        // compare each property in the snapshot. The property order
        // might differ, so using JSON.stringify to compare them
        // doesn't work.
        const changes: ChangesThatWouldBeOverwritten = Object.entries(
            change.payload.snapshot,
        )
            .map(([key, snapshotValue]: [string, unknown]) => {
                const existingValue =
                    currentStrategyConfig[key as keyof IFeatureStrategy];

                // compare, assuming that order never changes
                if (key === 'segments') {
                    // segments can be undefined on the original
                    // object, but that doesn't mean it has changed
                    if (hasDiff(existingValue ?? [], snapshotValue)) {
                        return {
                            property: key as keyof IFeatureStrategy,
                            oldValue: existingValue,
                            newValue: snapshotValue,
                        };
                    }
                } else if (key === 'variants') {
                    // strategy variants might not be defined, so use
                    // fallback values
                    if (hasDiff(existingValue ?? [], snapshotValue ?? [])) {
                        return {
                            property: key as keyof IFeatureStrategy,
                            oldValue: existingValue,
                            newValue: snapshotValue,
                        };
                    }
                } else if (hasChanged(existingValue, snapshotValue)) {
                    return {
                        property: key as keyof IFeatureStrategy,
                        oldValue: existingValue,
                        newValue: snapshotValue,
                    };
                }
            })
            .filter(
                (change): change is DataToOverwrite<keyof IFeatureStrategy> =>
                    Boolean(change),
            );

        if (changes.length) {
            // we have changes that would be overwritten
            changes.sort((a, b) => a.property.localeCompare(b.property));
            return changes;
        }

        // todo: ensure that there aren't any missing properties that
        // don't exist in the snapshot that might be overwritten?
    }

    return null;
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
}> = ({ actions, change, featureName, environmentName, projectId }) => {
    const checkForChanges = useUiFlag('changeRequestConflictHandling');
    const currentStrategy = useCurrentStrategy(
        change,
        projectId,
        featureName,
        environmentName,
    );

    const isStrategyAction =
        change.action === 'addStrategy' || change.action === 'updateStrategy';

    const changesThatWouldBeOverwritten =
        checkForChanges && change.action === 'updateStrategy'
            ? getChangesThatWouldBeOverwritten({
                  currentStrategyConfig: currentStrategy,
                  change,
              })
            : null;

    const hasVariantDiff =
        isStrategyAction &&
        hasDiff(currentStrategy?.variants || [], change.payload.variants || []);

    return (
        <>
            {change.action === 'addStrategy' && (
                <>
                    <ChangeItemCreateEditWrapper>
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
                    </ChangeItemCreateEditWrapper>
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
                <ChangeItemWrapper>
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
                </ChangeItemWrapper>
            )}
            {change.action === 'updateStrategy' && (
                <>
                    <ChangeItemCreateEditWrapper>
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
                    </ChangeItemCreateEditWrapper>
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
