import { type FC, type ReactNode, useRef, useState } from 'react';
import { styled, Typography } from '@mui/material';
import type {
    ChangeRequestState,
    IChangeRequestAddReleasePlan,
    IChangeRequestChangeMilestoneProgression,
    IChangeRequestChangeSafeguard,
    IChangeRequestDeleteMilestoneProgression,
    IChangeRequestDeleteReleasePlan,
    IChangeRequestDeleteSafeguard,
    IChangeRequestFeature,
    IChangeRequestResumeMilestoneProgression,
    IChangeRequestStartMilestone,
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
import type {
    ChangeMilestoneProgressionSchema,
    CreateSafeguardSchema,
} from 'openapi';
import { ConsolidatedProgressionChanges } from './ConsolidatedReleasePlanChanges.tsx';
import { formatUnknownError } from 'utils/formatUnknownError.ts';
import {
    SafeguardChangeView,
    SafeguardDeleteView,
} from './SafeguardChangeViews.tsx';

const StyledTabs = styled(Tabs)(({ theme }) => ({
    display: 'flex',
    flexFlow: 'column',
    gap: theme.spacing(1),
}));

const DeleteReleasePlan: FC<{
    change: IChangeRequestDeleteReleasePlan;
    currentReleasePlan?: IReleasePlan;
    changeRequestState: ChangeRequestState;
    actions?: ReactNode;
}> = ({ change, currentReleasePlan, changeRequestState, actions }) => {
    const releasePlan =
        (changeRequestState === 'Applied' || !currentReleasePlan) &&
        change.payload.snapshot
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

const ResumeMilestoneProgression: FC<{
    change: IChangeRequestResumeMilestoneProgression;
    currentReleasePlan?: IReleasePlan;
    changeRequestState: ChangeRequestState;
    environmentName: string;
    featureName: string;
    actions?: ReactNode;
}> = (props) => {
    const {
        change,
        currentReleasePlan,
        changeRequestState,
        environmentName,
        featureName,
        actions,
    } = props;
    const releasePlan =
        (changeRequestState === 'Applied' || !currentReleasePlan) &&
        change.payload.snapshot
            ? change.payload.snapshot
            : currentReleasePlan;

    if (!releasePlan) return;

    return (
        <ChangeItemWrapper>
            <ChangeItemInfo>
                <Added>Resume automation</Added>
                <Typography component='span'>
                    Resume automation for release plan {releasePlan.name} for{' '}
                    {featureName} in {environmentName}
                </Typography>
                {actions}
            </ChangeItemInfo>
        </ChangeItemWrapper>
    );
};

const StartMilestone: FC<{
    change: IChangeRequestStartMilestone;
    currentReleasePlan?: IReleasePlan;
    changeRequestState: ChangeRequestState;
    actions?: ReactNode;
}> = ({ change, currentReleasePlan, changeRequestState, actions }) => {
    const releasePlan =
        (changeRequestState === 'Applied' || !currentReleasePlan) &&
        change.payload.snapshot
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
                    environmentId={releasePlan.environment}
                    featureId={releasePlan.featureName}
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

const ChangeSafeguard: FC<{
    change: IChangeRequestChangeSafeguard;
    currentReleasePlan?: IReleasePlan;
    changeRequestState: ChangeRequestState;
    environmentName: string;
    featureName: string;
    actions?: ReactNode;
    onSubmit: (data: CreateSafeguardSchema) => void;
    onDelete: (safeguardId: string) => void;
}> = ({ change, currentReleasePlan, changeRequestState, ...rest }) => {
    const releasePlan =
        (changeRequestState === 'Applied' || !currentReleasePlan) &&
        change.payload.snapshot
            ? change.payload.snapshot
            : currentReleasePlan;

    if (!releasePlan || !change.payload.safeguard) return;

    return (
        <SafeguardChangeView
            safeguard={change.payload.safeguard}
            currentSafeguard={releasePlan.safeguards?.[0]}
            changeRequestState={changeRequestState}
            {...rest}
        />
    );
};

const DeleteSafeguard: FC<{
    change: IChangeRequestDeleteSafeguard;
    currentReleasePlan?: IReleasePlan;
    changeRequestState: ChangeRequestState;
    environmentName: string;
    featureName: string;
    actions?: ReactNode;
    onSubmit: (data: CreateSafeguardSchema) => void;
    onDelete: (safeguardId: string) => void;
}> = ({ change, currentReleasePlan, changeRequestState, ...rest }) => {
    const releasePlan =
        (changeRequestState === 'Applied' || !currentReleasePlan) &&
        change.payload.snapshot
            ? change.payload.snapshot
            : currentReleasePlan;

    const safeguard = releasePlan?.safeguards?.[0];

    if (!safeguard) return;

    return (
        <SafeguardDeleteView
            safeguard={safeguard}
            changeRequestState={changeRequestState}
            {...rest}
        />
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

export const ReleasePlanChange: FC<{
    actions?: ReactNode;
    change:
        | IChangeRequestAddReleasePlan
        | IChangeRequestDeleteReleasePlan
        | IChangeRequestStartMilestone
        | IChangeRequestChangeMilestoneProgression
        | IChangeRequestDeleteMilestoneProgression
        | IChangeRequestChangeSafeguard
        | IChangeRequestDeleteSafeguard
        | IChangeRequestResumeMilestoneProgression;
    environmentName: string;
    featureName: string;
    projectId: string;
    changeRequestState: ChangeRequestState;
    feature?: IChangeRequestFeature; // Optional feature object for consolidated progression changes
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
    const { releasePlans } = useFeatureReleasePlans(
        projectId,
        featureName,
        environmentName,
    );
    const currentReleasePlan = releasePlans[0];
    const { addChange } = useChangeRequestApi();
    const { refetch: refetchChangeRequests } =
        usePendingChangeRequests(projectId);
    const { setToastData, setToastApiError } = useToast();

    const changeSafeguardSubmit = async (data: CreateSafeguardSchema) => {
        try {
            await addChange(projectId, environmentName, {
                feature: featureName,
                action: 'changeReleasePlanSafeguard' as const,
                payload: {
                    planId: currentReleasePlan.id,
                    safeguard: data,
                },
            });
            await refetchChangeRequests();
            setToastData({
                type: 'success',
                text: 'Added to draft',
            });
            onRefetch?.();
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const deleteSafeguardSubmit = async (safeguardId: string) => {
        try {
            await addChange(projectId, environmentName, {
                feature: featureName,
                action: 'deleteReleasePlanSafeguard',
                payload: {
                    planId: currentReleasePlan.id,
                    safeguardId: safeguardId,
                },
            });
            await refetchChangeRequests();
            setToastData({
                type: 'success',
                text: 'Added to draft',
            });
            onRefetch?.();
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const changeMilestoneProgressionSubmit = async (
        sourceMilestoneId: string,
        payload: ChangeMilestoneProgressionSchema,
    ) => {
        try {
            await addChange(projectId, environmentName, {
                feature: featureName,
                action: 'changeMilestoneProgression',
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
            onRefetch?.();
        } catch (error) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const deleteMilestonProgressionSubmit = async (
        sourceMilestoneId: string,
    ) => {
        try {
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
            onRefetch?.();
        } catch (error) {
            setToastApiError(formatUnknownError(error));
        }
    };

    // If this is a progression change and we have the full feature object,
    // check if we should consolidate with other progression changes
    if (
        feature &&
        (change.action === 'changeMilestoneProgression' ||
            change.action === 'deleteMilestoneProgression')
    ) {
        const progressionChanges = feature.changes.filter(
            (
                change,
            ): change is
                | IChangeRequestChangeMilestoneProgression
                | IChangeRequestDeleteMilestoneProgression =>
                change.action === 'changeMilestoneProgression' ||
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
                changeRequestState={changeRequestState}
                onUpdateChangeRequestSubmit={changeMilestoneProgressionSubmit}
                onDeleteChangeRequestSubmit={deleteMilestonProgressionSubmit}
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
            {change.action === 'resumeMilestoneProgression' && (
                <ResumeMilestoneProgression
                    change={change}
                    currentReleasePlan={currentReleasePlan}
                    changeRequestState={changeRequestState}
                    environmentName={environmentName}
                    featureName={featureName}
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
            {change.action === 'changeReleasePlanSafeguard' && (
                <ChangeSafeguard
                    change={change}
                    currentReleasePlan={currentReleasePlan}
                    changeRequestState={changeRequestState}
                    environmentName={environmentName}
                    featureName={featureName}
                    onSubmit={changeSafeguardSubmit}
                    onDelete={deleteSafeguardSubmit}
                    actions={actions}
                />
            )}
            {change.action === 'deleteReleasePlanSafeguard' && (
                <DeleteSafeguard
                    change={change}
                    currentReleasePlan={currentReleasePlan}
                    changeRequestState={changeRequestState}
                    environmentName={environmentName}
                    featureName={featureName}
                    onSubmit={changeSafeguardSubmit}
                    onDelete={deleteSafeguardSubmit}
                    actions={actions}
                />
            )}
        </>
    );
};
