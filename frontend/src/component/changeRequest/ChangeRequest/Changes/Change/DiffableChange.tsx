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
        <Tabs
            aria-label='View rendered change or JSON diff'
            selectionFollowsFocus
            defaultValue={0}
        >
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
                <RightHandSide>
                    <StyledTabList>
                        <StyledTab>Change</StyledTab>
                        <StyledTab>View diff</StyledTab>
                    </StyledTabList>
                    {actions}
                </RightHandSide>
            </ChangeItemCreateEditDeleteWrapper>
            <TabPanel>
                {referenceStrategy && (
                    <StrategyExecution strategy={referenceStrategy} />
                )}
            </TabPanel>
            <TabPanel>
                <StrategyDiff
                    change={change}
                    currentStrategy={referenceStrategy}
                />
            </TabPanel>
        </Tabs>
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

export const StyledTab = styled(({ children }: ButtonProps) => (
    <Tab slots={{ root: StyledButton }}>{children}</Tab>
))(({ theme }) => ({
    position: 'absolute',
    top: theme.spacing(-0.5),
    left: theme.spacing(2),
    transform: 'translateY(-50%)',
    padding: theme.spacing(0.75, 1),
    lineHeight: 1,
    fontSize: theme.fontSizes.smallerBody,
    color: theme.palette.text.primary,
    background: theme.palette.background.application,
    borderRadius: theme.shape.borderRadiusExtraLarge,
    zIndex: theme.zIndex.fab,
    textTransform: 'uppercase',
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
            defaultValue={0}
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
                        <StyledTab>Change</StyledTab>
                        <StyledTab>View diff</StyledTab>
                    </StyledTabList>
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

            <TabPanel>
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
            <TabPanel>
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
    <Tabs
        aria-label='View rendered change or JSON diff'
        selectionFollowsFocus
        defaultValue={0}
    >
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
            <RightHandSide>
                <StyledTabList>
                    <StyledTab>Change</StyledTab>
                    <StyledTab>View diff</StyledTab>
                </StyledTabList>
                {actions}
            </RightHandSide>
        </ChangeItemCreateEditDeleteWrapper>
        <TabPanel>
            <StrategyExecution strategy={change.payload} />
            {change.payload.variants?.length ? (
                <StyledBox>
                    <StyledTypography>
                        Adding strategy variants:
                    </StyledTypography>
                    <EnvironmentVariantsTable
                        variants={change.payload.variants || []}
                    />
                </StyledBox>
            ) : null}
        </TabPanel>
        <TabPanel>
            <StrategyDiff change={change} currentStrategy={undefined} />
        </TabPanel>
    </Tabs>
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
