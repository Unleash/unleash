import Delete from '@mui/icons-material/Delete';
import { styled } from '@mui/material';
import { DELETE_FEATURE_STRATEGY } from '@server/types/permissions';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import { useReleasePlansApi } from 'hooks/api/actions/useReleasePlansApi/useReleasePlansApi';
import { useFeatureReleasePlans } from 'hooks/api/getters/useFeatureReleasePlans/useFeatureReleasePlans';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import useToast from 'hooks/useToast';
import type {
    IReleasePlan,
    IReleasePlanMilestone,
} from 'interfaces/releasePlans';
import { useState } from 'react';
import { formatUnknownError } from 'utils/formatUnknownError';
import { ReleasePlanRemoveDialog } from './ReleasePlanRemoveDialog.tsx';
import { ReleasePlanMilestone } from './ReleasePlanMilestone/ReleasePlanMilestone.tsx';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';
import { useChangeRequestApi } from 'hooks/api/actions/useChangeRequestApi/useChangeRequestApi';
import { usePendingChangeRequests } from 'hooks/api/getters/usePendingChangeRequests/usePendingChangeRequests';
import { ReleasePlanChangeRequestDialog } from './ChangeRequest/ReleasePlanChangeRequestDialog.tsx';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { Truncator } from 'component/common/Truncator/Truncator';
import { useUiFlag } from 'hooks/useUiFlag';
import { MilestoneProgressionForm } from './MilestoneProgressionForm/MilestoneProgressionForm.tsx';
import { useMilestoneProgressionsApi } from 'hooks/api/actions/useMilestoneProgressionsApi/useMilestoneProgressionsApi';
import { DeleteProgressionDialog } from './DeleteProgressionDialog.tsx';
import type {
    CreateMilestoneProgressionSchema,
    UpdateMilestoneProgressionSchema,
} from 'openapi';
import { ReleasePlanProvider } from './ReleasePlanContext.tsx';

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

const StyledBody = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
}));

const StyledConnection = styled('div', {
    shouldForwardProp: (prop) => prop !== 'isCompleted',
})<{ isCompleted: boolean }>(({ theme, isCompleted }) => ({
    width: 2,
    height: theme.spacing(2),
    backgroundColor: isCompleted
        ? theme.palette.divider
        : theme.palette.primary.main,
    marginLeft: theme.spacing(3.25),
}));

interface IReleasePlanProps {
    plan: IReleasePlan;
    environmentIsDisabled?: boolean;
    readonly?: boolean;
}

export const ReleasePlan = ({
    plan,
    environmentIsDisabled,
    readonly,
}: IReleasePlanProps) => {
    const {
        id,
        name,
        description,
        activeMilestoneId,
        featureName,
        environment,
        milestones,
    } = plan;

    const projectId = useRequiredPathParam('projectId');
    const { refetch } = useFeatureReleasePlans(
        projectId,
        featureName,
        environment,
    );
    const { removeReleasePlanFromFeature, startReleasePlanMilestone } =
        useReleasePlansApi();
    const { deleteMilestoneProgression } = useMilestoneProgressionsApi();
    const { setToastData, setToastApiError } = useToast();
    const { trackEvent } = usePlausibleTracker();

    const [removeOpen, setRemoveOpen] = useState(false);
    const [changeRequestAction, setChangeRequestAction] = useState<
        | { type: 'removeReleasePlan'; environmentActive: boolean }
        | { type: 'startMilestone'; milestone: IReleasePlanMilestone }
        | {
              type: 'createMilestoneProgression';
              payload: CreateMilestoneProgressionSchema;
          }
        | {
              type: 'updateMilestoneProgression';
              sourceMilestoneId: string;
              payload: UpdateMilestoneProgressionSchema;
          }
        | {
              type: 'deleteMilestoneProgression';
              sourceMilestoneId: string;
          }
        | null
    >(null);
    const { isChangeRequestConfigured } = useChangeRequestsEnabled(projectId);
    const { addChange } = useChangeRequestApi();
    const { data: pendingChangeRequests, refetch: refetchChangeRequests } =
        usePendingChangeRequests(projectId);

    // Find progression changes for this feature in pending change requests
    const getPendingProgressionChange = (sourceMilestoneId: string) => {
        if (!pendingChangeRequests) return null;

        for (const cr of pendingChangeRequests) {
            if (cr.environment !== environment) continue;

            const feature = cr.features.find((f) => f.name === featureName);
            if (!feature) continue;

            // Look for update or delete progression changes
            const change = feature.changes.find(
                (c: any) =>
                    (c.action === 'updateMilestoneProgression' &&
                        (c.payload.sourceMilestoneId === sourceMilestoneId ||
                            c.payload.sourceMilestone === sourceMilestoneId)) ||
                    (c.action === 'deleteMilestoneProgression' &&
                        (c.payload.sourceMilestoneId === sourceMilestoneId ||
                            c.payload.sourceMilestone === sourceMilestoneId)),
            );

            if (change) {
                return {
                    action: change.action,
                    payload: change.payload,
                    changeRequestId: cr.id,
                };
            }
        }

        return null;
    };
    const milestoneProgressionsEnabled = useUiFlag('milestoneProgression');
    const [progressionFormOpenIndex, setProgressionFormOpenIndex] = useState<
        number | null
    >(null);
    const [milestoneToDeleteProgression, setMilestoneToDeleteProgression] =
        useState<IReleasePlanMilestone | null>(null);
    const [isDeletingProgression, setIsDeletingProgression] = useState(false);

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

            case 'createMilestoneProgression':
                await addChange(projectId, environment, {
                    feature: featureName,
                    action: 'createMilestoneProgression',
                    payload: changeRequestAction.payload,
                });
                break;

            case 'updateMilestoneProgression':
                await addChange(projectId, environment, {
                    feature: featureName,
                    action: 'updateMilestoneProgression',
                    payload: {
                        sourceMilestone: changeRequestAction.sourceMilestoneId,
                        ...changeRequestAction.payload,
                    },
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

            refetch();
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
                refetch();
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

    const handleProgressionSave = async () => {
        setProgressionFormOpenIndex(null);
        await refetch();
    };

    const handleProgressionCancel = () => {
        setProgressionFormOpenIndex(null);
    };

    const handleProgressionChangeRequestSubmit = (
        payload: CreateMilestoneProgressionSchema,
    ) => {
        setChangeRequestAction({
            type: 'createMilestoneProgression',
            payload,
        });
    };

    const handleUpdateProgressionChangeRequestSubmit = (
        sourceMilestoneId: string,
        payload: UpdateMilestoneProgressionSchema,
    ) => {
        setChangeRequestAction({
            type: 'updateMilestoneProgression',
            sourceMilestoneId,
            payload,
        });
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
        if (!isDeletingProgression) {
            setMilestoneToDeleteProgression(null);
        }
    };

    const onDeleteProgressionConfirm = async () => {
        if (!milestoneToDeleteProgression || isDeletingProgression) return;

        setIsDeletingProgression(true);
        try {
            await deleteMilestoneProgression(
                projectId,
                environment,
                featureName,
                milestoneToDeleteProgression.id,
            );
            await refetch();
            setMilestoneToDeleteProgression(null);
            setToastData({
                type: 'success',
                text: 'Automation removed successfully',
            });
        } catch (error: unknown) {
            setMilestoneToDeleteProgression(null);
            setToastApiError(formatUnknownError(error));
        } finally {
            setIsDeletingProgression(false);
        }
    };

    const activeIndex = milestones.findIndex(
        (milestone) => milestone.id === activeMilestoneId,
    );

    return (
        <ReleasePlanProvider
            getPendingProgressionChange={getPendingProgressionChange}
        >
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
                <StyledBody>
                {milestones.map((milestone, index) => {
                    const isNotLastMilestone = index < milestones.length - 1;
                    const isProgressionFormOpen =
                        progressionFormOpenIndex === index;
                    const nextMilestoneId = milestones[index + 1]?.id || '';
                    const handleOpenProgressionForm = () =>
                        setProgressionFormOpenIndex(index);

                    return (
                        <div key={milestone.id}>
                            <ReleasePlanMilestone
                                readonly={readonly}
                                milestone={milestone}
                                status={
                                    milestone.id === activeMilestoneId
                                        ? environmentIsDisabled
                                            ? 'paused'
                                            : 'active'
                                        : index < activeIndex
                                          ? 'completed'
                                          : 'not-started'
                                }
                                onStartMilestone={onStartMilestone}
                                showAutomation={
                                    milestoneProgressionsEnabled &&
                                    isNotLastMilestone &&
                                    !readonly
                                }
                                onAddAutomation={handleOpenProgressionForm}
                                onDeleteAutomation={
                                    milestone.transitionCondition
                                        ? () =>
                                              handleDeleteProgression(milestone)
                                        : undefined
                                }
                                automationForm={
                                    isProgressionFormOpen ? (
                                        <MilestoneProgressionForm
                                            sourceMilestoneId={milestone.id}
                                            targetMilestoneId={nextMilestoneId}
                                            projectId={projectId}
                                            environment={environment}
                                            featureName={featureName}
                                            onSave={handleProgressionSave}
                                            onCancel={handleProgressionCancel}
                                            onChangeRequestSubmit={(payload) =>
                                                handleProgressionChangeRequestSubmit(
                                                    payload,
                                                )
                                            }
                                        />
                                    ) : undefined
                                }
                                projectId={projectId}
                                environment={environment}
                                featureName={featureName}
                                onUpdate={refetch}
                                onUpdateChangeRequestSubmit={
                                    handleUpdateProgressionChangeRequestSubmit
                                }
                                allMilestones={milestones}
                                activeMilestoneId={activeMilestoneId}
                            />
                            <ConditionallyRender
                                condition={isNotLastMilestone}
                                show={
                                    <StyledConnection
                                        isCompleted={index < activeIndex}
                                    />
                                }
                            />
                        </div>
                    );
                })}
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
                    isDeleting={isDeletingProgression}
                />
            )}
        </StyledContainer>
        </ReleasePlanProvider>
    );
};
