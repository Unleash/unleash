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
} from 'component/changeRequest/changeRequest.types';
import { useCurrentStrategy } from './hooks/useCurrentStrategy.ts';
import { Badge } from 'component/common/Badge/Badge';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { flexRow } from 'themes/themeStyles';
import { EnvironmentVariantsTable } from 'component/feature/FeatureView/FeatureVariants/FeatureEnvironmentVariants/EnvironmentVariantsCard/EnvironmentVariantsTable/EnvironmentVariantsTable';
import { ChangeOverwriteWarning } from './ChangeOverwriteWarning/ChangeOverwriteWarning.tsx';
import type { IFeatureStrategy } from 'interfaces/strategy';
import { Tab, TabList, TabPanel, Tabs } from './ChangeTabComponents.tsx';
import { ChangeStrategyName } from './ChangeStrategyName.tsx';
import { StrategyDiff } from './StrategyDiff.tsx';
import { ChangeItemInfo } from './Change.styles.tsx';

const ChangeItemCreateEditDeleteWrapper = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    gap: theme.spacing(1),
    alignItems: 'center',
    marginBottom: theme.spacing(1),
    width: '100%',
    flexFlow: 'row wrap',
}));

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
        return <Typography color='text.secondary'>Editing strategy</Typography>;
    }

    if (!wasDisabled && willBeDisabled) {
        return <Typography color='error.dark'>Editing strategy</Typography>;
    }

    if (wasDisabled && !willBeDisabled) {
        return <Typography color='success.dark'>Editing strategy</Typography>;
    }

    return <Typography>Editing strategy</Typography>;
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
            <ChangeItemCreateEditDeleteWrapper>
                <ChangeItemInfo>
                    <Typography
                        sx={(theme) => ({
                            color: theme.palette.error.main,
                        })}
                    >
                        - Deleting strategy
                    </Typography>
                    <ChangeStrategyName name={name || ''} title={title} />
                </ChangeItemInfo>
                {actions}
            </ChangeItemCreateEditDeleteWrapper>
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
                    <ChangeStrategyName
                        name={change.payload.name}
                        title={change.payload.title}
                        previousTitle={previousTitle}
                    />
                </ChangeItemInfo>
                {actions}
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
    actions?: ReactNode;
}> = ({ change, actions }) => (
    <>
        <ChangeItemCreateEditDeleteWrapper>
            <ChangeItemInfo>
                <Typography
                    color={
                        change.payload?.disabled
                            ? 'text.secondary'
                            : 'success.dark'
                    }
                    component='span'
                >
                    + Adding strategy
                </Typography>{' '}
                <ChangeStrategyName
                    name={change.payload.name}
                    title={change.payload.title}
                />
                <DisabledEnabledState
                    disabled
                    show={change.payload?.disabled === true}
                />
            </ChangeItemInfo>
            {actions}
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

export const StrategyChange: FC<{
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

    const actionsWithTabs = (
        <ActionsContainer>
            <TabList>
                <Tab>Change</Tab>
                <Tab>View diff</Tab>
            </TabList>
            {actions}
        </ActionsContainer>
    );

    return (
        <Tabs>
            {change.action === 'addStrategy' && (
                <AddStrategy change={change} actions={actionsWithTabs} />
            )}
            {change.action === 'deleteStrategy' && (
                <DeleteStrategy
                    change={change}
                    changeRequestState={changeRequestState}
                    currentStrategy={currentStrategy}
                    actions={actionsWithTabs}
                />
            )}
            {change.action === 'updateStrategy' && (
                <UpdateStrategy
                    change={change}
                    changeRequestState={changeRequestState}
                    currentStrategy={currentStrategy}
                    actions={actionsWithTabs}
                />
            )}
        </Tabs>
    );
};
