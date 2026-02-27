import type React from 'react';
import type { FC, ReactNode } from 'react';
import { Box, styled, Tooltip, Typography } from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import { StrategyExecution } from 'component/feature/FeatureView/FeatureOverview/FeatureOverviewEnvironments/FeatureOverviewEnvironment/EnvironmentAccordionBody/StrategyDraggableItem/StrategyItem/StrategyExecution/StrategyExecution';
import type {
    ChangeRequestState,
    IChangeRequestAddStrategy,
    IChangeRequestDeleteStrategy,
    IChangeRequestUpdateStrategy,
    IChangeRequestUpdateMilestoneStrategy,
} from 'component/changeRequest/changeRequest.types';
import { useCurrentStrategy } from './hooks/useCurrentStrategy.ts';
import { Badge } from 'component/common/Badge/Badge';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { flexRow } from 'themes/themeStyles';
import { EnvironmentVariantsTable } from 'component/feature/FeatureView/FeatureVariants/FeatureEnvironmentVariants/EnvironmentVariantsCard/EnvironmentVariantsTable/EnvironmentVariantsTable';
import { ChangeOverwriteWarning } from './ChangeOverwriteWarning/ChangeOverwriteWarning.tsx';
import type { IFeatureStrategy } from 'interfaces/strategy';
import { Tab, TabList, TabPanel, Tabs } from './ChangeTabComponents.tsx';
import { StrategyDiff } from './StrategyDiff.tsx';
import {
    Action,
    AddedStrategy,
    ChangeItemInfo,
    ChangeItemWrapper,
    Deleted,
} from './Change.styles.tsx';
import { NameWithChangeInfo } from './NameWithChangeInfo/NameWithChangeInfo.tsx';

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
                title='This strategy will not be taken into account when evaluating the feature flag.'
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
            title='This strategy was disabled before. With this change, it will be taken into account when evaluating the feature flag.'
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
        return <Action color='text.secondary'>Editing strategy</Action>;
    }

    if (!wasDisabled && willBeDisabled) {
        return <Action color='error.dark'>Editing strategy</Action>;
    }

    if (wasDisabled && !willBeDisabled) {
        return <Action color='success.dark'>Editing strategy</Action>;
    }

    return <Action>Editing strategy</Action>;
};

const hasDiff = (object: unknown, objectToCompare: unknown) =>
    JSON.stringify(object) !== JSON.stringify(objectToCompare);

const DeleteStrategy: FC<{
    change: IChangeRequestDeleteStrategy;
    changeRequestState: ChangeRequestState;
    currentStrategy: IFeatureStrategy | undefined;
    actions?: ReactNode;
}> = ({ change, changeRequestState, currentStrategy, actions }) => {
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
            <ChangeItemWrapper>
                <ChangeItemInfo>
                    <Deleted>Deleting strategy</Deleted>
                    <NameWithChangeInfo
                        newName={title}
                        previousName={referenceStrategy?.title}
                    />
                </ChangeItemInfo>
                {actions}
            </ChangeItemWrapper>
            <TabPanel>
                {referenceStrategy && (
                    <StrategyExecution strategy={referenceStrategy} />
                )}
            </TabPanel>
            <TabPanel variant='diff'>
                <StrategyDiff
                    change={change}
                    currentStrategy={referenceStrategy}
                />
            </TabPanel>
        </>
    );
};

const UpdateStrategy: FC<{
    change:
        | IChangeRequestUpdateStrategy
        | IChangeRequestUpdateMilestoneStrategy;
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
        <>
            <ChangeOverwriteWarning
                data={{
                    current: currentStrategy,
                    change,
                    changeType: 'strategy',
                }}
                changeRequestState={changeRequestState}
            />
            <ChangeItemWrapper>
                <ChangeItemInfo>
                    <EditHeader
                        wasDisabled={currentStrategy?.disabled}
                        willBeDisabled={change.payload?.disabled}
                    />
                    <NameWithChangeInfo
                        newName={change.payload.title}
                        previousName={previousTitle}
                    />
                </ChangeItemInfo>
                {actions}
            </ChangeItemWrapper>
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
            <TabPanel variant='diff'>
                <StrategyDiff
                    change={change}
                    currentStrategy={referenceStrategy}
                />
            </TabPanel>
        </>
    );
};

const AddStrategy: FC<{
    change: IChangeRequestAddStrategy;
    isDefaultChange?: boolean;
    actions?: ReactNode;
}> = ({ change, isDefaultChange, actions }) => (
    <>
        <ChangeItemWrapper>
            <ChangeItemInfo>
                <AddedStrategy disabled={change.payload?.disabled}>
                    Adding {isDefaultChange && 'default'} strategy
                </AddedStrategy>
                <NameWithChangeInfo newName={change.payload.title} />
                <DisabledEnabledState
                    disabled
                    show={change.payload?.disabled === true}
                />
            </ChangeItemInfo>
            {actions}
        </ChangeItemWrapper>
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
        <TabPanel variant='diff'>
            <StrategyDiff change={change} currentStrategy={undefined} />
        </TabPanel>
    </>
);

const ActionsContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexFlow: 'row wrap',
    alignItems: 'center',
    columnGap: theme.spacing(1),
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
    display: 'flex',
    flexFlow: 'column',
    gap: theme.spacing(1),
}));

export const StrategyChange: FC<{
    actions?: ReactNode;
    change:
        | IChangeRequestAddStrategy
        | IChangeRequestDeleteStrategy
        | IChangeRequestUpdateStrategy
        | IChangeRequestUpdateMilestoneStrategy;
    environmentName: string;
    featureName: string;
    projectId: string;
    changeRequestState: ChangeRequestState;
    isDefaultChange?: boolean;
}> = ({
    actions,
    change,
    featureName,
    environmentName,
    projectId,
    changeRequestState,
    isDefaultChange,
}) => {
    const currentStrategy = useCurrentStrategy(
        change,
        projectId,
        featureName,
        environmentName,
    );

    const actionsWithTabs = (
        <ActionsContainer>
            <TabList>
                <Tab>View change</Tab>
                <Tab>View diff</Tab>
            </TabList>
            {actions}
        </ActionsContainer>
    );

    return (
        <StyledTabs>
            {change.action === 'addStrategy' && (
                <AddStrategy
                    change={change}
                    actions={actionsWithTabs}
                    isDefaultChange={isDefaultChange}
                />
            )}
            {change.action === 'deleteStrategy' && (
                <DeleteStrategy
                    change={change}
                    changeRequestState={changeRequestState}
                    currentStrategy={currentStrategy}
                    actions={actionsWithTabs}
                />
            )}
            {(change.action === 'updateStrategy' ||
                change.action === 'updateMilestoneStrategy') && (
                <UpdateStrategy
                    change={change}
                    changeRequestState={changeRequestState}
                    currentStrategy={currentStrategy}
                    actions={actionsWithTabs}
                />
            )}
        </StyledTabs>
    );
};
