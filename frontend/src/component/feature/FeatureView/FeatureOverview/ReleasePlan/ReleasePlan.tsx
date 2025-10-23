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
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';
import { useChangeRequestApi } from 'hooks/api/actions/useChangeRequestApi/useChangeRequestApi';
import { usePendingChangeRequests } from 'hooks/api/getters/usePendingChangeRequests/usePendingChangeRequests';
import { ReleasePlanChangeRequestDialog } from './ChangeRequest/ReleasePlanChangeRequestDialog.tsx';
import type {
    IChangeRequestChangeMilestoneProgression,
    IChangeRequestDeleteMilestoneProgression,
} from 'component/changeRequest/changeRequest.types';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { Truncator } from 'component/common/Truncator/Truncator';
import { useUiFlag } from 'hooks/useUiFlag';
import { useMilestoneProgressionsApi } from 'hooks/api/actions/useMilestoneProgressionsApi/useMilestoneProgressionsApi';
import { DeleteProgressionDialog } from './DeleteProgressionDialog.tsx';
import type { ChangeMilestoneProgressionSchema } from 'openapi';
import { ReleasePlanMilestoneItem } from './ReleasePlanMilestoneItem/ReleasePlanMilestoneItem.tsx';

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
              type: 'changeMilestoneProgression';
              payload: ChangeMilestoneProgressionSchema;
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
                        onUpdate={refetch}
                    />
                ))}
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
    );
};
