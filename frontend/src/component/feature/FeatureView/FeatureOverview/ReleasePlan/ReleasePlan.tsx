import Delete from '@mui/icons-material/Delete';
import { Alert, styled, Link } from '@mui/material';
import PlayCircle from '@mui/icons-material/PlayCircle';
import { DELETE_FEATURE_STRATEGY } from '@server/types/permissions';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import { useReleasePlansApi } from 'hooks/api/actions/useReleasePlansApi/useReleasePlansApi';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import useToast from 'hooks/useToast';
import type {
    IReleasePlan,
    IReleasePlanMilestone,
} from 'interfaces/releasePlans';
import { useState } from 'react';
import { formatUnknownError } from 'utils/formatUnknownError';
import { ReleasePlanRemoveDialog } from './ReleasePlanRemoveDialog.tsx';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';
import { useChangeRequestApi } from 'hooks/api/actions/useChangeRequestApi/useChangeRequestApi';
import { usePendingChangeRequests } from 'hooks/api/getters/usePendingChangeRequests/usePendingChangeRequests';
import { ReleasePlanChangeRequestDialog } from './ChangeRequest/ReleasePlanChangeRequestDialog.tsx';
import { ResumeAutomationChangeRequestDialog } from './ChangeRequest/ResumeAutomationChangeRequestDialog.tsx';
import type {
    IChangeRequestChangeMilestoneProgression,
    IChangeRequestDeleteMilestoneProgression,
    IChangeRequestChangeSafeguard,
    IChangeRequestDeleteSafeguard,
} from 'component/changeRequest/changeRequest.types';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { Truncator } from 'component/common/Truncator/Truncator';
import { useUiFlag } from 'hooks/useUiFlag';
import { useMilestoneProgressionsApi } from 'hooks/api/actions/useMilestoneProgressionsApi/useMilestoneProgressionsApi';
import { DeleteProgressionDialog } from './DeleteProgressionDialog.tsx';
import type { ChangeMilestoneProgressionSchema } from 'openapi';
import { ReleasePlanMilestoneItem } from './ReleasePlanMilestoneItem/ReleasePlanMilestoneItem.tsx';
import Add from '@mui/icons-material/Add';

import { StyledActionButton } from './ReleasePlanMilestoneItem/StyledActionButton.tsx';
import {
    SafeguardForm,
    useSafeguardForm,
} from './SafeguardForm/SafeguardForm.tsx';
import { useSafeguardsApi } from 'hooks/api/actions/useSafeguardsApi/useSafeguardsApi';
import type { CreateSafeguardSchema } from 'openapi/models/createSafeguardSchema';
import { DeleteSafeguardDialog } from './DeleteSafeguardDialog.tsx';
import { Badge } from 'component/common/Badge/Badge';
import { formatDateYMDHMS } from 'utils/formatDate';

const StyledContainer = styled('div')(({ theme }) => ({
    padding: theme.spacing(2),
    paddingTop: theme.spacing(0),
    background: 'inherit',
    display: 'flex',
    flexFlow: 'column',
    gap: theme.spacing(1),
}));

const StyledHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    color: theme.palette.text.primary,
}));

const StyledHeaderGroup = styled('hgroup')(({ theme }) => ({
    paddingTop: theme.spacing(1.5),
}));

const StyledHeaderTitleLabel = styled('p')(({ theme }) => ({
    fontWeight: 'bold',
    fontSize: theme.typography.body1.fontSize,
    lineHeight: 0.5,
    marginBottom: theme.spacing(0.5),
    display: 'inline',
}));

const StyledHeaderTitle = styled('h3')(({ theme }) => ({
    display: 'inline',
    margin: 0,
    fontWeight: 'normal',
    fontSize: theme.typography.body1.fontSize,
}));

const StyledHeaderDescription = styled('p')(({ theme }) => ({
    marginTop: theme.spacing(1),
    fontSize: theme.typography.body2.fontSize,
    color: theme.palette.text.secondary,
}));

const StyledBody = styled('div', {
    shouldForwardProp: (prop) => prop !== 'border',
})<{ border: 'solid' | 'dashed' | null }>(({ theme, border }) => ({
    display: 'flex',
    flexDirection: 'column',
    ...(border && {
        border: `1px ${border} ${theme.palette.neutral.border}`,
        borderRadius: theme.shape.borderRadiusMedium,
    }),
}));

const StyledAddSafeguard = styled('div', {
    shouldForwardProp: (prop) => prop !== 'border',
})<{ border: 'solid' | 'dashed' | null }>(({ theme, border }) => ({
    display: 'flex',
    borderBottom: `1px ${border || 'dashed'} ${theme.palette.neutral.border}`,
    padding: theme.spacing(0.25, 0.25),
}));

const StyledAddSafeguardContent = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    justifyContent: 'space-between',
    width: '100%',
    paddingRight: theme.spacing(2),
}));

const StyledAlert = styled(Alert)(({ theme }) => ({
    margin: theme.spacing(1, 0),
}));

const StyledMilestones = styled('div', {
    shouldForwardProp: (prop) => prop !== 'safeguards',
})<{ safeguards: boolean }>(({ theme, safeguards }) => ({
    ...(safeguards && {
        padding: theme.spacing(1.5, 1.5),
    }),
}));

const StyledResumeMilestoneProgressions = styled(Link)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    textDecoration: 'none',
    color: 'inherit',
    whiteSpace: 'nowrap',
}));

interface IReleasePlanProps {
    plan: IReleasePlan;
    environmentIsDisabled?: boolean;
    readonly?: boolean;
    onAutomationChange?: () => void;
}

export const ReleasePlan = ({
    plan,
    environmentIsDisabled,
    readonly,
    onAutomationChange,
}: IReleasePlanProps) => {
    const {
        id,
        name,
        description,
        activeMilestoneId,
        featureName,
        environment,
        milestones,
        safeguards,
    } = plan;

    const projectId = useRequiredPathParam('projectId');
    const { removeReleasePlanFromFeature, startReleasePlanMilestone } =
        useReleasePlansApi();
    const {
        deleteMilestoneProgression,
        resumeMilestoneProgressions,
        loading: milestoneProgressionLoading,
    } = useMilestoneProgressionsApi();
    const {
        createOrUpdateSafeguard,
        deleteSafeguard,
        loading: safeguardLoading,
    } = useSafeguardsApi();
    const { setToastData, setToastApiError } = useToast();
    const { trackEvent } = usePlausibleTracker();

    const [removeOpen, setRemoveOpen] = useState(false);
    const [resumeDialogOpen, setResumeDialogOpen] = useState(false);
    const [changeRequestAction, setChangeRequestAction] = useState<
        | { type: 'removeReleasePlan'; environmentActive: boolean }
        | { type: 'startMilestone'; milestone: IReleasePlanMilestone }
        | {
              type: 'changeMilestoneProgression';
              payload: ChangeMilestoneProgressionSchema;
          }
        | {
              type: 'deleteMilestoneProgression';
              sourceMilestoneId: string;
          }
        | {
              type: 'deleteSafeguard';
              safeguardId: string;
          }
        | null
    >(null);
    const { isChangeRequestConfigured } = useChangeRequestsEnabled(projectId);
    const { addChange } = useChangeRequestApi();
    const { data: pendingChangeRequests, refetch: refetchChangeRequests } =
        usePendingChangeRequests(projectId);
    const releasePlanAutomationsPaused = milestones.some((milestone) =>
        Boolean(milestone.pausedAt),
    );
    const pausedAt = milestones.find(
        (milestone) => milestone.pausedAt,
    )?.pausedAt;

    const getPendingSafeguardAction = ():
        | IChangeRequestChangeSafeguard['action']
        | IChangeRequestDeleteSafeguard['action']
        | null => {
        if (!pendingChangeRequests) return null;

        for (const changeRequest of pendingChangeRequests) {
            if (changeRequest.environment !== environment) continue;

            const featureInChangeRequest = changeRequest.features.find(
                (featureItem) => featureItem.name === featureName,
            );
            if (!featureInChangeRequest) continue;

            const safeguardChange = featureInChangeRequest.changes.find(
                (
                    change,
                ): change is
                    | IChangeRequestChangeSafeguard
                    | IChangeRequestDeleteSafeguard =>
                    (change.action === 'changeSafeguard' &&
                        change.payload.planId === id) ||
                    (change.action === 'deleteSafeguard' &&
                        change.payload.planId === id),
            );

            if (safeguardChange) {
                return safeguardChange.action;
            }
        }

        return null;
    };

    const getPendingProgressionChange = (sourceMilestoneId: string) => {
        if (!pendingChangeRequests) return null;

        for (const changeRequest of pendingChangeRequests) {
            if (changeRequest.environment !== environment) continue;

            const featureInChangeRequest = changeRequest.features.find(
                (featureItem) => featureItem.name === featureName,
            );
            if (!featureInChangeRequest) continue;

            // Look for change or delete progression changes
            const progressionChange = featureInChangeRequest.changes.find(
                (
                    change,
                ): change is
                    | IChangeRequestChangeMilestoneProgression
                    | IChangeRequestDeleteMilestoneProgression =>
                    (change.action === 'changeMilestoneProgression' &&
                        change.payload.sourceMilestone === sourceMilestoneId) ||
                    (change.action === 'deleteMilestoneProgression' &&
                        change.payload.sourceMilestone === sourceMilestoneId),
            );

            if (progressionChange) {
                return {
                    action: progressionChange.action,
                    payload: progressionChange.payload,
                    changeRequestId: changeRequest.id,
                };
            }
        }

        return null;
    };
    const milestoneProgressionsEnabled = useUiFlag('milestoneProgression');
    const safeguardsEnabled = useUiFlag('safeguards');
    const [progressionFormOpenIndex, setProgressionFormOpenIndex] = useState<
        number | null
    >(null);
    const [milestoneToDeleteProgression, setMilestoneToDeleteProgression] =
        useState<IReleasePlanMilestone | null>(null);

    const [safeguardDeleteDialogOpen, setSafeguardDeleteDialogOpen] =
        useState(false);
    const { safeguardFormOpen, setSafeguardFormOpen } =
        useSafeguardForm(safeguards);

    const onChangeRequestConfirm = async () => {
        if (!changeRequestAction) return;

        switch (changeRequestAction.type) {
            case 'removeReleasePlan':
                await addChange(projectId, environment, {
                    feature: featureName,
                    action: 'deleteReleasePlan',
                    payload: {
                        planId: plan.id,
                    },
                });
                break;

            case 'startMilestone':
                await addChange(projectId, environment, {
                    feature: featureName,
                    action: 'startMilestone',
                    payload: {
                        planId: plan.id,
                        milestoneId: changeRequestAction.milestone.id,
                    },
                });
                break;

            case 'changeMilestoneProgression':
                await addChange(projectId, environment, {
                    feature: featureName,
                    action: 'changeMilestoneProgression',
                    payload: changeRequestAction.payload,
                });
                break;

            case 'deleteMilestoneProgression':
                await addChange(projectId, environment, {
                    feature: featureName,
                    action: 'deleteMilestoneProgression',
                    payload: {
                        sourceMilestone: changeRequestAction.sourceMilestoneId,
                    },
                });
                break;

            case 'deleteSafeguard':
                await addChange(projectId, environment, {
                    feature: featureName,
                    action: 'deleteSafeguard',
                    payload: {
                        planId: plan.id,
                        safeguardId: changeRequestAction.safeguardId,
                    },
                });
                break;
        }

        await refetchChangeRequests();

        setToastData({
            type: 'success',
            text: 'Added to draft',
        });

        setChangeRequestAction(null);
        setProgressionFormOpenIndex(null);
    };

    const confirmRemoveReleasePlan = () => {
        if (isChangeRequestConfigured(environment)) {
            setChangeRequestAction({
                type: 'removeReleasePlan',
                environmentActive: !environmentIsDisabled,
            });
        } else {
            setRemoveOpen(true);
        }

        trackEvent('release-management', {
            props: {
                eventType: 'remove-plan',
                plan: name,
            },
        });
    };

    const onRemoveConfirm = async () => {
        try {
            await removeReleasePlanFromFeature(
                projectId,
                featureName,
                environment,
                id,
            );
            setToastData({
                text: `Release plan "${name}" has been removed from ${featureName} in ${environment}`,
                type: 'success',
            });

            onAutomationChange?.();
            setRemoveOpen(false);
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const onStartMilestone = async (milestone: IReleasePlanMilestone) => {
        if (isChangeRequestConfigured(environment)) {
            setChangeRequestAction({
                type: 'startMilestone',
                milestone,
            });
        } else {
            try {
                await startReleasePlanMilestone(
                    projectId,
                    featureName,
                    environment,
                    id,
                    milestone.id,
                );
                setToastData({
                    text: `Milestone "${milestone.name}" has started`,
                    type: 'success',
                });
                onAutomationChange?.();
            } catch (error: unknown) {
                setToastApiError(formatUnknownError(error));
            }
        }

        trackEvent('release-management', {
            props: {
                eventType: 'start-milestone',
                plan: name,
                milestone: milestone.name,
            },
        });
    };

    const handleAddToChangeRequest = (action: {
        type: 'changeMilestoneProgression';
        payload: ChangeMilestoneProgressionSchema;
    }) => {
        setChangeRequestAction(action);
    };

    const handleDeleteProgression = (milestone: IReleasePlanMilestone) => {
        if (isChangeRequestConfigured(environment)) {
            setChangeRequestAction({
                type: 'deleteMilestoneProgression',
                sourceMilestoneId: milestone.id,
            });
        } else {
            setMilestoneToDeleteProgression(milestone);
        }
    };

    const handleCloseDeleteDialog = () => {
        if (!milestoneProgressionLoading) {
            setMilestoneToDeleteProgression(null);
        }
    };

    const onDeleteProgressionConfirm = async () => {
        if (!milestoneToDeleteProgression || milestoneProgressionLoading)
            return;

        try {
            await deleteMilestoneProgression({
                projectId,
                environment,
                featureName,
                sourceMilestoneId: milestoneToDeleteProgression.id,
            });
            onAutomationChange?.();
            setMilestoneToDeleteProgression(null);
            setToastData({
                type: 'success',
                text: 'Automation removed successfully',
            });
        } catch (error: unknown) {
            setMilestoneToDeleteProgression(null);
            setToastApiError(formatUnknownError(error));
        }
    };

    const onResumeMilestoneProgressions = async () => {
        if (isChangeRequestConfigured(environment)) {
            setResumeDialogOpen(true);
        } else {
            try {
                await resumeMilestoneProgressions({
                    projectId,
                    environment,
                    featureName,
                    planId: id,
                });
                setToastData({
                    type: 'success',
                    text: 'Automation resumed successfully',
                });
                onAutomationChange?.();
            } catch (error: unknown) {
                setToastApiError(formatUnknownError(error));
            }
        }
    };

    const handleResumeDialogConfirm = async () => {
        setResumeDialogOpen(false);
        try {
            await addChange(projectId, environment, {
                feature: featureName,
                action: 'resumeMilestoneProgression',
                payload: {
                    planId: id,
                },
            });
            await refetchChangeRequests();
            setToastData({
                type: 'success',
                text: 'Added to draft',
            });
            onAutomationChange?.();
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const activeIndex = milestones.findIndex(
        (milestone) => milestone.id === activeMilestoneId,
    );

    const handleSafeguardSubmit = async (data: CreateSafeguardSchema) => {
        if (isChangeRequestConfigured(environment)) {
            try {
                await addChange(projectId, environment, {
                    feature: featureName,
                    action: 'changeSafeguard' as const,
                    payload: {
                        planId: id,
                        safeguard: data,
                    },
                });
                await refetchChangeRequests();
                setToastData({
                    type: 'success',
                    text: 'Added to draft',
                });
                onAutomationChange?.();
            } catch (error: unknown) {
                setToastApiError(formatUnknownError(error));
            }
        } else {
            try {
                await createOrUpdateSafeguard({
                    projectId,
                    featureName,
                    environment,
                    planId: id,
                    body: data,
                });
                setToastData({
                    type: 'success',
                    text: 'Safeguard added successfully',
                });
                onAutomationChange?.();
            } catch (error: unknown) {
                setToastApiError(formatUnknownError(error));
            }
        }
    };

    const handleSafeguardDelete = () => {
        if (isChangeRequestConfigured(environment) && safeguards.length > 0) {
            setChangeRequestAction({
                type: 'deleteSafeguard',
                safeguardId: safeguards[0].id,
            });
        } else {
            setSafeguardDeleteDialogOpen(true);
        }
    };

    const onSafeguardDeleteConfirm = async () => {
        if (safeguards.length === 0 || safeguardLoading) return;

        try {
            await deleteSafeguard({
                projectId,
                featureName,
                environment,
                planId: id,
                safeguardId: safeguards[0].id,
            });
            setToastData({
                type: 'success',
                text: 'Safeguard deleted successfully',
            });
            onAutomationChange?.();
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        } finally {
            setSafeguardDeleteDialogOpen(false);
        }
    };

    const handleCloseSafeguardDeleteDialog = () => {
        if (!safeguardLoading) {
            setSafeguardDeleteDialogOpen(false);
        }
    };

    const safeguardBorder =
        safeguardsEnabled && safeguards
            ? safeguards[0]
                ? 'solid'
                : 'dashed'
            : null;

    const pendingSafeguardAction = getPendingSafeguardAction();
    const safeguardBadge =
        pendingSafeguardAction === 'deleteSafeguard' ? (
            <Badge color='error'>Deleted in draft</Badge>
        ) : pendingSafeguardAction === 'changeSafeguard' ? (
            <Badge color='warning'>Modified in draft</Badge>
        ) : undefined;

    return (
        <StyledContainer>
            <StyledHeader>
                <StyledHeaderGroup>
                    <StyledHeaderTitleLabel>
                        Release plan:{' '}
                    </StyledHeaderTitleLabel>
                    <StyledHeaderTitle>{name}</StyledHeaderTitle>
                    <StyledHeaderDescription>
                        <Truncator lines={2} title={description}>
                            {description}
                        </Truncator>
                    </StyledHeaderDescription>
                </StyledHeaderGroup>
                {!readonly && (
                    <PermissionIconButton
                        onClick={confirmRemoveReleasePlan}
                        permission={DELETE_FEATURE_STRATEGY}
                        environmentId={environment}
                        projectId={projectId}
                        tooltipProps={{
                            title: 'Remove release plan',
                        }}
                    >
                        <Delete />
                    </PermissionIconButton>
                )}
            </StyledHeader>
            {releasePlanAutomationsPaused ? (
                <StyledAlert
                    severity='error'
                    action={
                        <StyledResumeMilestoneProgressions
                            variant='body2'
                            onClick={onResumeMilestoneProgressions}
                        >
                            <PlayCircle />
                            Resume automation
                        </StyledResumeMilestoneProgressions>
                    }
                >
                    <b>
                        Automation paused by safeguard
                        {pausedAt ? ` at ${formatDateYMDHMS(pausedAt)}` : ''}.
                    </b>{' '}
                    Existing users on this release plan can still access the
                    feature.
                </StyledAlert>
            ) : null}

            <StyledBody border={safeguardBorder}>
                {onAutomationChange && safeguardsEnabled ? (
                    <StyledAddSafeguard border={safeguardBorder}>
                        {safeguardFormOpen ? (
                            <SafeguardForm
                                safeguard={safeguards?.[0]}
                                onSubmit={handleSafeguardSubmit}
                                onCancel={() => setSafeguardFormOpen(false)}
                                onDelete={handleSafeguardDelete}
                                environment={environment}
                                featureId={featureName}
                                badge={safeguardBadge}
                            />
                        ) : (
                            <StyledAddSafeguardContent>
                                <StyledActionButton
                                    onClick={() => setSafeguardFormOpen(true)}
                                    color='primary'
                                    startIcon={<Add />}
                                    sx={{ m: 2 }}
                                >
                                    Add safeguard
                                </StyledActionButton>
                                {safeguardBadge}
                            </StyledAddSafeguardContent>
                        )}
                    </StyledAddSafeguard>
                ) : null}
                <StyledMilestones safeguards={safeguardsEnabled}>
                    {milestones.map((milestone, index) => (
                        <ReleasePlanMilestoneItem
                            key={milestone.id}
                            milestone={milestone}
                            index={index}
                            milestones={milestones}
                            activeMilestoneId={activeMilestoneId}
                            activeIndex={activeIndex}
                            environmentIsDisabled={environmentIsDisabled}
                            readonly={readonly}
                            milestoneProgressionsEnabled={
                                milestoneProgressionsEnabled
                            }
                            progressionFormOpenIndex={progressionFormOpenIndex}
                            onSetProgressionFormOpenIndex={
                                setProgressionFormOpenIndex
                            }
                            onStartMilestone={onStartMilestone}
                            onDeleteProgression={handleDeleteProgression}
                            onAddToChangeRequest={handleAddToChangeRequest}
                            getPendingProgressionChange={
                                getPendingProgressionChange
                            }
                            projectId={projectId}
                            environment={environment}
                            featureName={featureName}
                            onUpdate={onAutomationChange}
                        />
                    ))}
                </StyledMilestones>
            </StyledBody>
            <ReleasePlanRemoveDialog
                plan={plan}
                open={removeOpen}
                setOpen={setRemoveOpen}
                onConfirm={onRemoveConfirm}
                environmentActive={!environmentIsDisabled}
            />
            <ReleasePlanChangeRequestDialog
                featureId={featureName}
                environmentId={environment}
                releasePlan={plan}
                action={changeRequestAction}
                isOpen={changeRequestAction !== null}
                onConfirm={onChangeRequestConfirm}
                onClose={() => setChangeRequestAction(null)}
            />
            {milestoneToDeleteProgression && (
                <DeleteProgressionDialog
                    open={milestoneToDeleteProgression !== null}
                    onClose={handleCloseDeleteDialog}
                    onConfirm={onDeleteProgressionConfirm}
                    milestoneName={milestoneToDeleteProgression.name}
                    isDeleting={milestoneProgressionLoading}
                />
            )}
            <DeleteSafeguardDialog
                open={safeguardDeleteDialogOpen}
                onClose={handleCloseSafeguardDeleteDialog}
                onConfirm={onSafeguardDeleteConfirm}
                isDeleting={safeguardLoading}
            />
            <ResumeAutomationChangeRequestDialog
                isOpen={resumeDialogOpen}
                onConfirm={handleResumeDialogConfirm}
                onClose={() => setResumeDialogOpen(false)}
                featureId={featureName}
                environmentId={environment}
                releasePlanName={name}
            />
        </StyledContainer>
    );
};
