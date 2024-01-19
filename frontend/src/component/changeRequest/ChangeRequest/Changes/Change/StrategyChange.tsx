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
import { getChangesThatWouldBeOverwritten } from './strategy-change-diff-calculation';

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

    const hasDiff = (object: unknown, objectToCompare: unknown) =>
        JSON.stringify(object) !== JSON.stringify(objectToCompare);

    const isStrategyAction =
        change.action === 'addStrategy' || change.action === 'updateStrategy';

    const hasVariantDiff =
        isStrategyAction &&
        hasDiff(currentStrategy?.variants || [], change.payload.variants || []);

    const changesThatWouldBeOverwritten =
        checkForChanges && change.action === 'updateStrategy'
            ? getChangesThatWouldBeOverwritten(currentStrategy, change)
            : null;

    const ChangesToOverwrite = styled(Box)(({ theme }) => ({
        color: theme.palette.warning.dark,
        backgroundColor: theme.palette.warning.light,
        fontSize: theme.fontSizes.smallBody,
        borderRadius: theme.shape.borderRadiusLarge,
        padding: theme.spacing(2),
        marginBottom: theme.spacing(2),
    }));

    const OverwriteTable = styled('table')(({ theme }) => ({
        '&,td,tr,thead': {
            display: 'block',
            textAlign: 'margin-inline-start',
        },

        thead: {
            clip: 'rect(0 0 0 0)',
            clipPath: 'inset(50%)',
            height: '1px',
            overflow: 'hidden',
            position: 'absolute',
            whiteSpace: 'nowrap',
            width: '1px',
        },

        'tr + tr': {
            marginBlockStart: theme.spacing(2),
        },

        'td:first-of-type': {
            fontWeight: 'bold',
            '::after': {
                content: '":"',
            },
            textTransform: 'capitalize',
        },
        'td + td::before': {
            content: 'attr(data-column)',
            marginInlineEnd: theme.spacing(1),
            fontWeight: 'bold',
        },

        pre: {
            background: theme.palette.background.default,
            padding: theme.spacing(2),
            borderRadius: theme.shape.borderRadius,
            width: '100%',

            'ins, del': {
                textDecoration: 'none',
                'code::before': {
                    marginInlineEnd: theme.spacing(1),
                },
            },
            'del code::before': {
                content: '"-"',
            },
            'ins code::before': {
                content: '"+"',
            },
        },
    }));

    const overwriteWarning = changesThatWouldBeOverwritten ? (
        <ChangesToOverwrite>
            <p>
                <strong>Heads up!</strong> The strategy has been updated since
                you made your changes. Applying this change now would overwrite
                the configuration that is currently live.
            </p>
            <details open>
                <summary>Changes that would be overwritten</summary>

                <OverwriteTable>
                    <thead>
                        <tr>
                            <th>Property</th>
                            <th>Current value</th>
                            <th>Value after change</th>
                        </tr>
                    </thead>

                    <tbody>
                        {changesThatWouldBeOverwritten.map(
                            ({ property, oldValue, newValue }) => (
                                <tr key={property}>
                                    <td data-column='Property'>{property}</td>
                                    <td data-column='Current value'>
                                        <pre>
                                            <del>
                                                {JSON.stringify(
                                                    oldValue,
                                                    null,
                                                    2,
                                                )
                                                    .split('\n')
                                                    .map((line, index) => (
                                                        <code key={index}>
                                                            {line + '\n'}
                                                        </code>
                                                    ))}
                                            </del>
                                        </pre>
                                    </td>
                                    <td data-column='Value after change'>
                                        <pre>
                                            <ins>
                                                {JSON.stringify(
                                                    newValue,
                                                    null,
                                                    2,
                                                )
                                                    .split('\n')
                                                    .map((line, index) => (
                                                        <code key={index}>
                                                            {line + '\n'}
                                                        </code>
                                                    ))}
                                            </ins>
                                        </pre>
                                    </td>
                                </tr>
                            ),
                        )}
                    </tbody>
                </OverwriteTable>
            </details>
        </ChangesToOverwrite>
    ) : null;

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
                    {overwriteWarning}
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
