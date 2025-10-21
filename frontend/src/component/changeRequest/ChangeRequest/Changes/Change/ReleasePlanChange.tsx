import { useRef, useState, type FC, type ReactNode } from 'react';
import { Alert, styled, Typography } from '@mui/material';
import type {
    ChangeRequestState,
    IChangeRequestAddReleasePlan,
    IChangeRequestDeleteReleasePlan,
    IChangeRequestStartMilestone,
    IChangeRequestCreateMilestoneProgression,
    IChangeRequestUpdateMilestoneProgression,
    IChangeRequestDeleteMilestoneProgression,
    IChangeRequestFeature,
} from 'component/changeRequest/changeRequest.types';
import { useReleasePlanPreview } from 'hooks/useReleasePlanPreview';
import { useFeatureReleasePlans } from 'hooks/api/getters/useFeatureReleasePlans/useFeatureReleasePlans';
import { TooltipLink } from 'component/common/TooltipLink/TooltipLink';
import { EventDiff } from 'component/events/EventDiff/EventDiff';
import { ReleasePlan } from 'component/feature/FeatureView/FeatureOverview/ReleasePlan/ReleasePlan';
import { ReleasePlanMilestone } from 'component/feature/FeatureView/FeatureOverview/ReleasePlan/ReleasePlanMilestone/ReleasePlanMilestone';
import type { IReleasePlan } from 'interfaces/releasePlans';
import { Tab, TabList, TabPanel, Tabs } from './ChangeTabComponents.tsx';
import {
    Action,
    Added,
    ChangeItemInfo,
    ChangeItemWrapper,
    Deleted,
} from './Change.styles.tsx';
import { useChangeRequestApi } from 'hooks/api/actions/useChangeRequestApi/useChangeRequestApi';
import { usePendingChangeRequests } from 'hooks/api/getters/usePendingChangeRequests/usePendingChangeRequests';
import useToast from 'hooks/useToast';
import type { UpdateMilestoneProgressionSchema } from 'openapi';
import { ReleasePlanProvider } from 'component/feature/FeatureView/FeatureOverview/ReleasePlan/ReleasePlanContext.tsx';

// Indicates that a change is in draft and not yet part of a change request
const PENDING_CHANGE_REQUEST_ID = -1;

// Helper function to create getPendingProgressionChange for context
const createGetPendingProgressionChange = (
    progressionChanges: (IChangeRequestCreateMilestoneProgression | IChangeRequestUpdateMilestoneProgression | IChangeRequestDeleteMilestoneProgression)[]
) => {
    return (sourceMilestoneId: string) => {
        const change = progressionChanges.find(
            (progressionChange) =>
                (progressionChange.action === 'updateMilestoneProgression' &&
                    (progressionChange.payload.sourceMilestoneId === sourceMilestoneId ||
                        progressionChange.payload.sourceMilestone === sourceMilestoneId)) ||
                (progressionChange.action === 'deleteMilestoneProgression' &&
                    (progressionChange.payload.sourceMilestoneId === sourceMilestoneId ||
                        progressionChange.payload.sourceMilestone === sourceMilestoneId)) ||
                (progressionChange.action === 'createMilestoneProgression' &&
                    progressionChange.payload.sourceMilestone === sourceMilestoneId),
        );

        if (!change) return null;

        return {
            action: change.action,
            payload: change.payload,
            changeRequestId: PENDING_CHANGE_REQUEST_ID,
        };
    };
};

const StyledTabs = styled(Tabs)(({ theme }) => ({
    display: 'flex',
    flexFlow: 'column',
    gap: theme.spacing(1),
}));

const StyledConnection = styled('div')(({ theme }) => ({
    width: 2,
    height: theme.spacing(2),
    backgroundColor: theme.palette.divider,
    marginLeft: theme.spacing(3.25),
}));

const DeleteReleasePlan: FC<{
    change: IChangeRequestDeleteReleasePlan;
    currentReleasePlan?: IReleasePlan;
    changeRequestState: ChangeRequestState;
    actions?: ReactNode;
}> = ({ change, currentReleasePlan, changeRequestState, actions }) => {
    const releasePlan =
        changeRequestState === 'Applied' && change.payload.snapshot
            ? change.payload.snapshot
            : currentReleasePlan;

    if (!releasePlan) return;

    return (
        <>
            <ChangeItemWrapper>
                <ChangeItemInfo>
                    <Deleted>Deleting release plan</Deleted>
                    <Typography component='span'>{releasePlan.name}</Typography>
                    {actions}
                </ChangeItemInfo>
            </ChangeItemWrapper>
            <ReleasePlan plan={releasePlan} readonly />
        </>
    );
};

const StartMilestone: FC<{
    change: IChangeRequestStartMilestone;
    currentReleasePlan?: IReleasePlan;
    changeRequestState: ChangeRequestState;
    actions?: ReactNode;
}> = ({ change, currentReleasePlan, changeRequestState, actions }) => {
    const releasePlan =
        changeRequestState === 'Applied' && change.payload.snapshot
            ? change.payload.snapshot
            : currentReleasePlan;

    if (!releasePlan) return;

    const previousMilestone = releasePlan.milestones.find(
        (milestone) => milestone.id === releasePlan.activeMilestoneId,
    );

    const newMilestone = releasePlan.milestones.find(
        (milestone) => milestone.id === change.payload.milestoneId,
    );

    if (!newMilestone) return;

    return (
        <StyledTabs>
            <ChangeItemWrapper>
                <ChangeItemInfo>
                    <Added>Start milestone</Added>
                    <Typography component='span'>
                        {newMilestone.name}
                    </Typography>
                </ChangeItemInfo>
                <div>
                    <TabList>
                        <Tab>View change</Tab>
                        <Tab>View diff</Tab>
                    </TabList>
                    {actions}
                </div>
            </ChangeItemWrapper>
            <TabPanel>
                <ReleasePlanMilestone
                    readonly
                    milestone={newMilestone}
                    allMilestones={releasePlan.milestones}
                    activeMilestoneId={releasePlan.activeMilestoneId}
                />
            </TabPanel>
            <TabPanel variant='diff'>
                <EventDiff
                    entry={{
                        preData: previousMilestone,
                        data: newMilestone,
                    }}
                />
            </TabPanel>
        </StyledTabs>
    );
};

const AddReleasePlan: FC<{
    change: IChangeRequestAddReleasePlan;
    currentReleasePlan?: IReleasePlan;
    environmentName: string;
    featureName: string;
    actions?: ReactNode;
}> = ({
    change,
    currentReleasePlan,
    environmentName,
    featureName,
    actions,
}) => {
    const [currentTooltipOpen, setCurrentTooltipOpen] = useState(false);
    const currentTooltipCloseTimeoutRef = useRef<NodeJS.Timeout>();
    const openCurrentTooltip = () => {
        if (currentTooltipCloseTimeoutRef.current) {
            clearTimeout(currentTooltipCloseTimeoutRef.current);
        }
        setCurrentTooltipOpen(true);
    };
    const closeCurrentTooltip = () => {
        currentTooltipCloseTimeoutRef.current = setTimeout(() => {
            setCurrentTooltipOpen(false);
        }, 100);
    };

    const planPreview = useReleasePlanPreview(
        change.payload.templateId,
        featureName,
        environmentName,
    );

    const planPreviewDiff = {
        ...planPreview,
        discriminator: 'plan',
        releasePlanTemplateId: change.payload.templateId,
    };

    if (!currentReleasePlan) {
        return (
            <>
                <ChangeItemWrapper>
                    <ChangeItemInfo>
                        <Added>Adding release plan</Added>
                        <Typography component='span'>
                            {planPreview.name}
                        </Typography>
                        {actions}
                    </ChangeItemInfo>
                </ChangeItemWrapper>
                <ReleasePlan plan={planPreview} readonly />
            </>
        );
    }

    return (
        <StyledTabs>
            <ChangeItemWrapper>
                <ChangeItemInfo>
                    <Action>
                        Replacing{' '}
                        <TooltipLink
                            tooltip={
                                <div
                                    onMouseEnter={() => openCurrentTooltip()}
                                    onMouseLeave={() => closeCurrentTooltip()}
                                >
                                    <ReleasePlan
                                        plan={currentReleasePlan}
                                        readonly
                                    />
                                </div>
                            }
                            tooltipProps={{
                                open: currentTooltipOpen,
                                maxWidth: 500,
                                maxHeight: 600,
                            }}
                        >
                            <span
                                onMouseEnter={() => openCurrentTooltip()}
                                onMouseLeave={() => closeCurrentTooltip()}
                            >
                                current
                            </span>
                        </TooltipLink>{' '}
                        release plan with {planPreview.name}
                    </Action>
                </ChangeItemInfo>
                <div>
                    <TabList>
                        <Tab>View change</Tab>
                        <Tab>View diff</Tab>
                    </TabList>
                    {actions}
                </div>
            </ChangeItemWrapper>
            <TabPanel>
                <ReleasePlan plan={planPreview} readonly />
            </TabPanel>
            <TabPanel variant='diff'>
                <EventDiff
                    entry={{
                        preData: currentReleasePlan,
                        data: planPreviewDiff,
                    }}
                />
            </TabPanel>
        </StyledTabs>
    );
};

const CreateMilestoneProgression: FC<{
    change: IChangeRequestCreateMilestoneProgression;
    currentReleasePlan?: IReleasePlan;
    actions?: ReactNode;
    projectId: string;
    environmentName: string;
    featureName: string;
    changeRequestState: ChangeRequestState;
    onUpdate?: () => void;
    onUpdateChangeRequestSubmit?: (
        sourceMilestoneId: string,
        payload: UpdateMilestoneProgressionSchema,
    ) => void;
    onDeleteChangeRequestSubmit?: (sourceMilestoneId: string) => void;
}> = ({
    change,
    currentReleasePlan,
    actions,
    projectId,
    environmentName,
    featureName,
    changeRequestState,
    onUpdate,
    onUpdateChangeRequestSubmit,
    onDeleteChangeRequestSubmit,
}) => {
    // Use snapshot if available (for Applied state) or if the change has a snapshot
    const basePlan = change.payload.snapshot || currentReleasePlan;
    if (!basePlan) return null;

    // Create a modified release plan with the progression added
    const modifiedPlan: IReleasePlan = {
        ...basePlan,
        milestones: basePlan.milestones.map((milestone) => {
            if (milestone.id === change.payload.sourceMilestone) {
                return {
                    ...milestone,
                    transitionCondition: change.payload.transitionCondition,
                };
            }
            return milestone;
        }),
    };

    const sourceMilestone = basePlan.milestones.find(
        (milestone) => milestone.id === change.payload.sourceMilestone,
    );

    const sourceMilestoneName =
        sourceMilestone?.name || change.payload.sourceMilestone;

    const targetMilestoneName =
        basePlan.milestones.find(
            (milestone) => milestone.id === change.payload.targetMilestone,
        )?.name || change.payload.targetMilestone;

    // Get the milestone before and after for diff
    const previousMilestone = sourceMilestone;
    const newMilestone = modifiedPlan.milestones.find(
        (milestone) => milestone.id === change.payload.sourceMilestone,
    );

    // Create a function to get this specific change for the context
    const getPendingProgressionChange = (sourceMilestoneId: string) => {
        if (sourceMilestoneId === change.payload.sourceMilestone) {
            return {
                action: change.action,
                payload: change.payload,
                changeRequestId: -1,
            };
        }
        return null;
    };

    return (
        <ReleasePlanProvider getPendingProgressionChange={getPendingProgressionChange}>
        <StyledTabs>
            <ChangeItemWrapper>
                <ChangeItemInfo>
                    <Added>Adding automation to release plan</Added>
                    <Typography component='span'>
                        {sourceMilestoneName} → {targetMilestoneName}
                    </Typography>
                </ChangeItemInfo>
                <div>
                    <TabList>
                        <Tab>View change</Tab>
                        <Tab>View diff</Tab>
                    </TabList>
                    {actions}
                </div>
            </ChangeItemWrapper>
            <TabPanel>
                {modifiedPlan.milestones.map((milestone, index) => {
                    const isNotLastMilestone = index < modifiedPlan.milestones.length - 1;
                    const isTargetMilestone = milestone.id === change.payload.sourceMilestone;
                    const hasProgression = Boolean(milestone.transitionCondition);
                    const showAutomation = isTargetMilestone && isNotLastMilestone && hasProgression;

                    console.log('[CreateProgression] Milestone:', milestone.name, {
                        isTargetMilestone,
                        isNotLastMilestone,
                        hasProgression,
                        showAutomation,
                        transitionCondition: milestone.transitionCondition,
                        projectId,
                        environment: environmentName,
                        featureName,
                    });

                    return (
                        <div key={milestone.id}>
                            <ReleasePlanMilestone
                                readonly={changeRequestState === 'Applied' || changeRequestState === 'Cancelled'}
                                milestone={milestone}
                                showAutomation={showAutomation}
                                projectId={projectId}
                                environment={environmentName}
                                featureName={featureName}
                                onUpdate={onUpdate}
                                onUpdateChangeRequestSubmit={onUpdateChangeRequestSubmit}
                                onDeleteAutomation={
                                    showAutomation && onDeleteChangeRequestSubmit
                                        ? () => onDeleteChangeRequestSubmit(milestone.id)
                                        : undefined
                                }
                                allMilestones={modifiedPlan.milestones}
                                activeMilestoneId={modifiedPlan.activeMilestoneId}
                            />
                            {isNotLastMilestone && <StyledConnection />}
                        </div>
                    );
                })}
            </TabPanel>
            <TabPanel variant='diff'>
                <EventDiff
                    entry={{
                        preData: previousMilestone,
                        data: newMilestone,
                    }}
                />
            </TabPanel>
        </StyledTabs>
        </ReleasePlanProvider>
    );
};

const UpdateMilestoneProgression: FC<{
    change: IChangeRequestUpdateMilestoneProgression;
    currentReleasePlan?: IReleasePlan;
    actions?: ReactNode;
    projectId: string;
    environmentName: string;
    featureName: string;
    changeRequestState: ChangeRequestState;
    onUpdate?: () => void;
    onUpdateChangeRequestSubmit?: (
        sourceMilestoneId: string,
        payload: UpdateMilestoneProgressionSchema,
    ) => void;
    onDeleteChangeRequestSubmit?: (sourceMilestoneId: string) => void;
}> = ({
    change,
    currentReleasePlan,
    actions,
    projectId,
    environmentName,
    featureName,
    changeRequestState,
    onUpdate,
    onUpdateChangeRequestSubmit,
    onDeleteChangeRequestSubmit,
}) => {
    // Use snapshot if available (for Applied state) or if the change has a snapshot
    const basePlan = change.payload.snapshot || currentReleasePlan;
    if (!basePlan) return null;

    const sourceId = change.payload.sourceMilestoneId || change.payload.sourceMilestone;
    const sourceMilestone = basePlan.milestones.find(
        (milestone) => milestone.id === sourceId,
    );
    const sourceMilestoneName = sourceMilestone?.name || sourceId;

    // Create a modified release plan with the updated progression
    const modifiedPlan: IReleasePlan = {
        ...basePlan,
        milestones: basePlan.milestones.map((milestone) => {
            if (milestone.id === sourceId) {
                return {
                    ...milestone,
                    transitionCondition: change.payload.transitionCondition,
                };
            }
            return milestone;
        }),
    };

    // Get the milestone before and after for diff
    const previousMilestone = sourceMilestone;
    const newMilestone = modifiedPlan.milestones.find(
        (milestone) => milestone.id === change.payload.sourceMilestoneId,
    );

    // Create a function to get this specific change for the context
    const getPendingProgressionChange = (sourceMilestoneId: string) => {
        if (sourceMilestoneId === sourceId) {
            return {
                action: change.action,
                payload: change.payload,
                changeRequestId: -1,
            };
        }
        return null;
    };

    return (
        <ReleasePlanProvider getPendingProgressionChange={getPendingProgressionChange}>
        <StyledTabs>
            <ChangeItemWrapper>
                <ChangeItemInfo>
                    <Action>Updating automation in release plan</Action>
                    <Typography component='span'>
                        {sourceMilestoneName}
                    </Typography>
                </ChangeItemInfo>
                <div>
                    <TabList>
                        <Tab>View change</Tab>
                        <Tab>View diff</Tab>
                    </TabList>
                    {actions}
                </div>
            </ChangeItemWrapper>
            <TabPanel>
                {modifiedPlan.milestones.map((milestone, index) => {
                    const isNotLastMilestone = index < modifiedPlan.milestones.length - 1;
                    const showAutomation = milestone.id === sourceId && isNotLastMilestone && Boolean(milestone.transitionCondition);

                    return (
                        <div key={milestone.id}>
                            <ReleasePlanMilestone
                                readonly={changeRequestState === 'Applied' || changeRequestState === 'Cancelled'}
                                milestone={milestone}
                                showAutomation={showAutomation}
                                projectId={projectId}
                                environment={environmentName}
                                featureName={featureName}
                                onUpdate={onUpdate}
                                onUpdateChangeRequestSubmit={onUpdateChangeRequestSubmit}
                                onDeleteAutomation={
                                    showAutomation && onDeleteChangeRequestSubmit
                                        ? () => onDeleteChangeRequestSubmit(milestone.id)
                                        : undefined
                                }
                                allMilestones={modifiedPlan.milestones}
                                activeMilestoneId={modifiedPlan.activeMilestoneId}
                            />
                            {isNotLastMilestone && <StyledConnection />}
                        </div>
                    );
                })}
            </TabPanel>
            <TabPanel variant='diff'>
                <EventDiff
                    entry={{
                        preData: previousMilestone,
                        data: newMilestone,
                    }}
                />
            </TabPanel>
        </StyledTabs>
        </ReleasePlanProvider>
    );
};

const ConsolidatedProgressionChanges: FC<{
    feature: IChangeRequestFeature;
    currentReleasePlan?: IReleasePlan;
    projectId: string;
    environmentName: string;
    featureName: string;
    changeRequestState: ChangeRequestState;
    onUpdate?: () => void;
    onUpdateChangeRequestSubmit?: (
        sourceMilestoneId: string,
        payload: UpdateMilestoneProgressionSchema,
    ) => void;
    onDeleteChangeRequestSubmit?: (sourceMilestoneId: string) => void;
}> = ({
    feature,
    currentReleasePlan,
    projectId,
    environmentName,
    featureName,
    changeRequestState,
    onUpdate,
    onUpdateChangeRequestSubmit,
    onDeleteChangeRequestSubmit,
}) => {
    // Get all progression changes for this feature
    const progressionChanges = feature.changes.filter(
        (change): change is IChangeRequestCreateMilestoneProgression | IChangeRequestUpdateMilestoneProgression | IChangeRequestDeleteMilestoneProgression =>
            change.action === 'createMilestoneProgression' ||
            change.action === 'updateMilestoneProgression' ||
            change.action === 'deleteMilestoneProgression',
    );

    if (progressionChanges.length === 0) return null;

    // Use snapshot from first change if available, otherwise use current release plan
    // Prioritize create/update changes over delete changes for snapshot selection
    const firstChangeWithSnapshot = progressionChanges.find((change) =>
        change.payload?.snapshot && (change.action === 'createMilestoneProgression' || change.action === 'updateMilestoneProgression')
    ) || progressionChanges.find((change) => change.payload?.snapshot);
    const basePlan = firstChangeWithSnapshot?.payload?.snapshot || currentReleasePlan;

    if (!basePlan) {
        console.error('[ConsolidatedProgressionChanges] No release plan data available', {
            hasSnapshot: !!firstChangeWithSnapshot,
            hasCurrentPlan: !!currentReleasePlan,
            progressionChanges
        });
        return (
            <Alert severity="error">
                Unable to load release plan data. Please refresh the page.
            </Alert>
        );
    }

    // Apply all progression changes to the release plan
    const modifiedPlan: IReleasePlan = {
        ...basePlan,
        milestones: basePlan.milestones.map((milestone) => {
            // Find if there's a progression change for this milestone
            const createChange = progressionChanges.find(
                (change): change is IChangeRequestCreateMilestoneProgression =>
                    change.action === 'createMilestoneProgression' &&
                    change.payload.sourceMilestone === milestone.id,
            );
            const updateChange = progressionChanges.find(
                (change): change is IChangeRequestUpdateMilestoneProgression =>
                    change.action === 'updateMilestoneProgression' &&
                    (change.payload.sourceMilestoneId === milestone.id || change.payload.sourceMilestone === milestone.id),
            );
            const deleteChange = progressionChanges.find(
                (change): change is IChangeRequestDeleteMilestoneProgression =>
                    change.action === 'deleteMilestoneProgression' &&
                    (change.payload.sourceMilestoneId === milestone.id || change.payload.sourceMilestone === milestone.id),
            );

            // Check for conflicting changes (delete + create/update for same milestone)
            if (deleteChange && (createChange || updateChange)) {
                console.warn('[ConsolidatedProgressionChanges] Conflicting changes detected for milestone:', {
                    milestone: milestone.name,
                    hasCreate: !!createChange,
                    hasUpdate: !!updateChange,
                    hasDelete: !!deleteChange
                });
            }

            // If there's a delete change, remove the transition condition
            // Delete takes precedence over create/update
            if (deleteChange) {
                return {
                    ...milestone,
                    transitionCondition: null,
                };
            }

            const change = updateChange || createChange;
            if (change) {
                return {
                    ...milestone,
                    transitionCondition: change.payload.transitionCondition,
                };
            }
            return milestone;
        }),
    };

    const changeDescriptions = progressionChanges.map((change) => {
        const sourceId =
            change.action === 'createMilestoneProgression'
                ? change.payload.sourceMilestone
                : (change.payload.sourceMilestoneId || change.payload.sourceMilestone);
        const sourceName =
            basePlan.milestones.find((milestone) => milestone.id === sourceId)
                ?.name || sourceId;
        const action =
            change.action === 'createMilestoneProgression'
                ? 'Adding'
                : change.action === 'deleteMilestoneProgression'
                  ? 'Deleting'
                  : 'Updating';
        return `${action} automation for ${sourceName}`;
    });

    // Create a function to get pending progression changes for the context
    const getPendingProgressionChange = createGetPendingProgressionChange(progressionChanges);

    return (
        <ReleasePlanProvider getPendingProgressionChange={getPendingProgressionChange}>
        <StyledTabs>
            <ChangeItemWrapper>
                <ChangeItemInfo>
                    {progressionChanges.map((change, index) => {
                        const Component = change.action === 'deleteMilestoneProgression' ? Deleted : Added;
                        return (
                            <Component key={index}>
                                {changeDescriptions[index]}
                            </Component>
                        );
                    })}
                </ChangeItemInfo>
                <div>
                    <TabList>
                        <Tab>View change</Tab>
                        <Tab>View diff</Tab>
                    </TabList>
                </div>
            </ChangeItemWrapper>
            <TabPanel>
                {modifiedPlan.milestones.map((milestone, index) => {
                    const isNotLastMilestone =
                        index < modifiedPlan.milestones.length - 1;

                    // Check if there's a delete change for this milestone
                    const deleteChange = progressionChanges.find(
                        (change): change is IChangeRequestDeleteMilestoneProgression =>
                            change.action === 'deleteMilestoneProgression' &&
                            (change.payload.sourceMilestoneId === milestone.id || change.payload.sourceMilestone === milestone.id),
                    );

                    // If there's a delete change, use the original milestone from basePlan
                    const originalMilestone = deleteChange
                        ? basePlan.milestones.find(baseMilestone => baseMilestone.id === milestone.id)
                        : null;

                    // Warn if we can't find the original milestone for a delete change
                    if (deleteChange && !originalMilestone) {
                        console.error('[ConsolidatedProgressionChanges] Cannot find original milestone for delete', {
                            milestoneId: milestone.id,
                            milestoneName: milestone.name,
                            basePlanMilestones: basePlan.milestones.map(baseMilestone => ({ id: baseMilestone.id, name: baseMilestone.name }))
                        });
                    }

                    const displayMilestone = deleteChange && originalMilestone ? originalMilestone : milestone;

                    // Show automation section for any milestone that has a transition condition
                    // or if there's a delete change (to show what's being deleted)
                    const shouldShowAutomationSection = Boolean(displayMilestone.transitionCondition) || Boolean(deleteChange);
                    const showAutomation = isNotLastMilestone && shouldShowAutomationSection;

                    return (
                        <div key={milestone.id}>
                            <ReleasePlanMilestone
                                readonly={changeRequestState === 'Applied' || changeRequestState === 'Cancelled'}
                                milestone={displayMilestone}
                                showAutomation={showAutomation}
                                projectId={projectId}
                                environment={environmentName}
                                featureName={featureName}
                                onUpdate={onUpdate}
                                onUpdateChangeRequestSubmit={onUpdateChangeRequestSubmit}
                                onDeleteAutomation={
                                    showAutomation && onDeleteChangeRequestSubmit
                                        ? () => onDeleteChangeRequestSubmit(displayMilestone.id)
                                        : undefined
                                }
                                allMilestones={modifiedPlan.milestones}
                                activeMilestoneId={modifiedPlan.activeMilestoneId}
                            />
                            {isNotLastMilestone && <StyledConnection />}
                        </div>
                    );
                })}
            </TabPanel>
            <TabPanel variant='diff'>
                <EventDiff
                    entry={{
                        preData: basePlan,
                        data: modifiedPlan,
                    }}
                />
            </TabPanel>
        </StyledTabs>
        </ReleasePlanProvider>
    );
};

export const ReleasePlanChange: FC<{
    actions?: ReactNode;
    change:
        | IChangeRequestAddReleasePlan
        | IChangeRequestDeleteReleasePlan
        | IChangeRequestStartMilestone
        | IChangeRequestCreateMilestoneProgression
        | IChangeRequestUpdateMilestoneProgression
        | IChangeRequestDeleteMilestoneProgression;
    environmentName: string;
    featureName: string;
    projectId: string;
    changeRequestState: ChangeRequestState;
    feature?: any; // Optional feature object for consolidated progression changes
    onRefetch?: () => void;
}> = ({
    actions,
    change,
    featureName,
    environmentName,
    projectId,
    changeRequestState,
    feature,
    onRefetch,
}) => {
    const { releasePlans, refetch } = useFeatureReleasePlans(
        projectId,
        featureName,
        environmentName,
    );
    const currentReleasePlan = releasePlans[0];
    const { addChange } = useChangeRequestApi();
    const { refetch: refetchChangeRequests } = usePendingChangeRequests(projectId);
    const { setToastData } = useToast();

    const handleUpdate = async () => {
        await refetch();
        if (onRefetch) {
            await onRefetch();
        }
    };

    const handleUpdateChangeRequestSubmit = async (
        sourceMilestoneId: string,
        payload: UpdateMilestoneProgressionSchema,
    ) => {
        await addChange(projectId, environmentName, {
            feature: featureName,
            action: 'updateMilestoneProgression',
            payload: {
                sourceMilestone: sourceMilestoneId,
                ...payload,
            },
        });
        await refetchChangeRequests();
        setToastData({
            type: 'success',
            text: 'Added to draft',
        });
        if (onRefetch) {
            await onRefetch();
        }
    };

    const handleDeleteChangeRequestSubmit = async (sourceMilestoneId: string) => {
        await addChange(projectId, environmentName, {
            feature: featureName,
            action: 'deleteMilestoneProgression',
            payload: {
                sourceMilestone: sourceMilestoneId,
            },
        });
        await refetchChangeRequests();
        setToastData({
            type: 'success',
            text: 'Added to draft',
        });
        if (onRefetch) {
            await onRefetch();
        }
    };

    // If this is a progression change and we have the full feature object,
    // check if we should consolidate with other progression changes
    if (
        feature &&
        (change.action === 'createMilestoneProgression' ||
            change.action === 'updateMilestoneProgression' ||
            change.action === 'deleteMilestoneProgression')
    ) {
        const progressionChanges = feature.changes.filter(
            (change): change is IChangeRequestCreateMilestoneProgression | IChangeRequestUpdateMilestoneProgression | IChangeRequestDeleteMilestoneProgression =>
                change.action === 'createMilestoneProgression' ||
                change.action === 'updateMilestoneProgression' ||
                change.action === 'deleteMilestoneProgression',
        );

        // Only render if this is the first progression change
        const isFirstProgression =
            progressionChanges.length > 0 && progressionChanges[0] === change;
        if (!isFirstProgression) {
            return null; // Skip rendering, will be handled by the first one
        }

        return (
            <ConsolidatedProgressionChanges
                feature={feature}
                currentReleasePlan={currentReleasePlan}
                projectId={projectId}
                environmentName={environmentName}
                featureName={featureName}
                changeRequestState={changeRequestState}
                onUpdate={handleUpdate}
                onUpdateChangeRequestSubmit={handleUpdateChangeRequestSubmit}
                onDeleteChangeRequestSubmit={handleDeleteChangeRequestSubmit}
            />
        );
    }

    return (
        <>
            {change.action === 'addReleasePlan' && (
                <AddReleasePlan
                    change={change}
                    currentReleasePlan={currentReleasePlan}
                    environmentName={environmentName}
                    featureName={featureName}
                    actions={actions}
                />
            )}
            {change.action === 'deleteReleasePlan' && (
                <DeleteReleasePlan
                    change={change}
                    currentReleasePlan={currentReleasePlan}
                    changeRequestState={changeRequestState}
                    actions={actions}
                />
            )}
            {change.action === 'startMilestone' && (
                <StartMilestone
                    change={change}
                    currentReleasePlan={currentReleasePlan}
                    changeRequestState={changeRequestState}
                    actions={actions}
                />
            )}
            {change.action === 'createMilestoneProgression' && (
                <CreateMilestoneProgression
                    change={change}
                    currentReleasePlan={currentReleasePlan}
                    actions={actions}
                    projectId={projectId}
                    environmentName={environmentName}
                    featureName={featureName}
                    changeRequestState={changeRequestState}
                    onUpdate={handleUpdate}
                    onUpdateChangeRequestSubmit={handleUpdateChangeRequestSubmit}
                    onDeleteChangeRequestSubmit={handleDeleteChangeRequestSubmit}
                />
            )}
            {change.action === 'updateMilestoneProgression' && (
                <UpdateMilestoneProgression
                    change={change}
                    currentReleasePlan={currentReleasePlan}
                    actions={actions}
                    projectId={projectId}
                    environmentName={environmentName}
                    featureName={featureName}
                    changeRequestState={changeRequestState}
                    onUpdate={handleUpdate}
                    onUpdateChangeRequestSubmit={handleUpdateChangeRequestSubmit}
                    onDeleteChangeRequestSubmit={handleDeleteChangeRequestSubmit}
                />
            )}
        </>
    );
};
