import type React from 'react';
import type { FC, ReactNode } from 'react';
import {
    Box,
    Button,
    type ButtonProps,
    styled,
    Tooltip,
    Typography,
} from '@mui/material';
import { Tab, Tabs, TabsList, TabPanel } from '@mui/base';
import BlockIcon from '@mui/icons-material/Block';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import {
    StrategyDiff,
    StrategyTooltipLink,
} from '../../StrategyTooltipLink/StrategyTooltipLink.tsx';
import { StrategyExecution } from 'component/feature/FeatureView/FeatureOverview/FeatureOverviewEnvironments/FeatureOverviewEnvironment/EnvironmentAccordionBody/StrategyDraggableItem/StrategyItem/StrategyExecution/StrategyExecution';
import type {
    ChangeRequestState,
    IChangeRequestAddStrategy,
    IChangeRequestDeleteStrategy,
    IChangeRequestUpdateStrategy,
} from 'component/changeRequest/changeRequest.types';
import { useCurrentStrategy } from './hooks/useCurrentStrategy.ts';
import { Badge } from 'component/common/Badge/Badge';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { flexRow } from 'themes/themeStyles';
import { EnvironmentVariantsTable } from 'component/feature/FeatureView/FeatureVariants/FeatureEnvironmentVariants/EnvironmentVariantsCard/EnvironmentVariantsTable/EnvironmentVariantsTable';
import { ChangeOverwriteWarning } from './ChangeOverwriteWarning/ChangeOverwriteWarning.tsx';
import type { IFeatureStrategy } from 'interfaces/strategy';

export const ChangeItemWrapper = styled(Box)({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
});

const ChangeItemCreateEditDeleteWrapper = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    gap: theme.spacing(1),
    alignItems: 'center',
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

const DisabledEnabledState: FC<{ show?: boolean; disabled: boolean }> = ({
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

const EditHeader: FC<{
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

const DeleteStrategy: FC<{
    change: IChangeRequestDeleteStrategy;
    changeRequestState: ChangeRequestState;
    currentStrategy: IFeatureStrategy | undefined;
    actions?: ReactNode;
}> = ({ change, changeRequestState, currentStrategy, actions }) => {
    const name =
        changeRequestState === 'Applied'
            ? change.payload?.snapshot?.name
            : currentStrategy?.name;
    const title =
        changeRequestState === 'Applied'
            ? change.payload?.snapshot?.title
            : currentStrategy?.title;
    const referenceStrategy =
        changeRequestState === 'Applied'
            ? change.payload.snapshot
            : currentStrategy;

    return (
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
                    <StrategyTooltipLink name={name || ''} title={title}>
                        <StrategyDiff
                            change={change}
                            currentStrategy={referenceStrategy}
                        />
                    </StrategyTooltipLink>
                </ChangeItemInfo>
                <div>{actions}</div>
            </ChangeItemCreateEditDeleteWrapper>
            {referenceStrategy && (
                <StrategyExecution strategy={referenceStrategy} />
            )}
        </>
    );
};

const RightHandSide = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1),
    alignItems: 'center',
}));

const StyledTabList = styled(TabsList)(({ theme }) => ({
    display: 'inline-flex',
    flexDirection: 'row',
    gap: theme.spacing(0.5),
}));

export const StyledTabz = styled(
    ({
        label,
        value,
        ...props
    }: ButtonProps & { label: string; value: number }) => (
        <Button
            variant='text'
            tab-index={-1}
            component='div'
            data-label={label}
            role='tab'
            {...props}
        >
            <StyledTab value={value}>{label}</StyledTab>
        </Button>
    ),
)(({ theme }) => ({
    ':has([aria-selected="true"])': {
        backgroundColor: theme.palette.background.elevation1,
    },
    whiteSpace: 'nowrap',
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    '::before': {
        content: 'attr(data-label)',
        fontWeight: 'bold',
        visibility: 'hidden',
        display: 'block',
        padding: theme.spacing(1, 2),
    },
}));

const StyledButton = styled(Button)(({ theme }) => ({
    whiteSpace: 'nowrap',
    color: theme.palette.text.secondary,
    fontWeight: 'normal',
    '&[aria-selected="true"]': {
        fontWeight: 'bold',
        color: theme.palette.primary.main,
        background: theme.palette.background.elevation1,
    },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    backgroundColor: 'transparent',
    border: 'none',
    color: theme.palette.text.secondary,
    position: 'absolute',
    padding: theme.spacing(1, 2),
    '&[aria-selected="true"]': {
        fontWeight: 'bold',
        color: theme.palette.primary.main,
    },
    span: {},
    // '::before': {
    //     content: 'attr(data-label)',
    //     fontWeight: 'bold',
    //     visibility: 'hidden',
    //     display: 'block',
    // },
    // ':hover': {
    //     background: theme.palette.background.elevation2,
    // },
    ':focus-visible': {
        outline: 'none',
    },
}));

const UpdateStrategy: FC<{
    change: IChangeRequestUpdateStrategy;
    changeRequestState: ChangeRequestState;
    currentStrategy: IFeatureStrategy | undefined;
    actions?: ReactNode;
}> = ({ change, changeRequestState, currentStrategy, actions }) => {
    const previousTitle =
        changeRequestState === 'Applied'
            ? change.payload.snapshot?.title
            : currentStrategy?.title;
    const referenceStrategy =
        changeRequestState === 'Applied'
            ? change.payload.snapshot
            : currentStrategy;
    const hasVariantDiff = hasDiff(
        referenceStrategy?.variants || [],
        change.payload.variants || [],
    );

    return (
        <Tabs
            aria-label='View rendered change or JSON diff'
            selectionFollowsFocus
        >
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
                        name={change.payload.name}
                        title={change.payload.title}
                        previousTitle={previousTitle}
                    >
                        <StrategyDiff
                            change={change}
                            currentStrategy={referenceStrategy}
                        />
                    </StrategyTooltipLink>
                </ChangeItemInfo>
                <RightHandSide>
                    <StyledTabList>
                        <Tab<typeof StyledButton>
                            value={0}
                            slots={{ root: StyledButton }}
                        >
                            Change
                        </Tab>
                        <Tab<typeof StyledButton>
                            value={1}
                            slots={{ root: StyledButton }}
                        >
                            View diff
                        </Tab>
                    </StyledTabList>
                    <Button variant='text'>Change</Button>
                    {actions}
                </RightHandSide>
            </ChangeItemCreateEditDeleteWrapper>
            <ConditionallyRender
                condition={
                    change.payload?.disabled !== currentStrategy?.disabled
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

            <TabPanel value={0}>
                <StrategyExecution strategy={change.payload} />
                {hasVariantDiff ? (
                    <StyledBox>
                        {change.payload.variants?.length ? (
                            <>
                                <StyledTypography>
                                    {currentStrategy?.variants?.length
                                        ? 'Updating strategy variants to:'
                                        : 'Adding strategy variants:'}
                                </StyledTypography>
                                <EnvironmentVariantsTable
                                    variants={change.payload.variants || []}
                                />
                            </>
                        ) : (
                            <StyledTypography>
                                Removed all strategy variants.
                            </StyledTypography>
                        )}
                    </StyledBox>
                ) : null}
            </TabPanel>
            <TabPanel value={1}>
                <StrategyDiff
                    change={change}
                    currentStrategy={referenceStrategy}
                />
            </TabPanel>
        </Tabs>
    );
};

const AddStrategy: FC<{
    change: IChangeRequestAddStrategy;
    actions?: ReactNode;
}> = ({ change, actions }) => (
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
                <StrategyTooltipLink
                    name={change.payload.name}
                    title={change.payload.title}
                />
                <div>
                    <DisabledEnabledState
                        disabled
                        show={change.payload?.disabled === true}
                    />
                </div>
            </ChangeItemInfo>
            <StrategyDiff change={change} currentStrategy={undefined} />
            <div>{actions}</div>
        </ChangeItemCreateEditDeleteWrapper>
        <StrategyExecution strategy={change.payload} />
        {change.payload.variants?.length ? (
            <StyledBox>
                <StyledTypography>Adding strategy variants:</StyledTypography>
                <EnvironmentVariantsTable
                    variants={change.payload.variants || []}
                />
            </StyledBox>
        ) : null}
    </>
);

export const DiffableChange: FC<{
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

    return (
        <>
            {change.action === 'addStrategy' && (
                <AddStrategy change={change} actions={actions} />
            )}
            {change.action === 'deleteStrategy' && (
                <DeleteStrategy
                    change={change}
                    changeRequestState={changeRequestState}
                    currentStrategy={currentStrategy}
                    actions={actions}
                />
            )}
            {change.action === 'updateStrategy' && (
                <UpdateStrategy
                    change={change}
                    changeRequestState={changeRequestState}
                    currentStrategy={currentStrategy}
                    actions={actions}
                />
            )}
        </>
    );
};
