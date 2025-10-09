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
import { RemoveReleasePlanChangeRequestDialog } from './ChangeRequest/RemoveReleasePlanChangeRequestDialog.tsx';
import { StartMilestoneChangeRequestDialog } from './ChangeRequest/StartMilestoneChangeRequestDialog.tsx';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { Truncator } from 'component/common/Truncator/Truncator';
import { useUiFlag } from 'hooks/useUiFlag';
import { MilestoneProgressionForm } from './MilestoneProgressionForm/MilestoneProgressionForm.tsx';

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

const StyledConnection = styled('div')(({ theme }) => ({
    width: 4,
    height: theme.spacing(2),
    backgroundColor: theme.palette.divider,
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
    const { setToastData, setToastApiError } = useToast();
    const { trackEvent } = usePlausibleTracker();

    const [removeOpen, setRemoveOpen] = useState(false);
    const [changeRequestDialogRemoveOpen, setChangeRequestDialogRemoveOpen] =
        useState(false);
    const [
        changeRequestDialogStartMilestoneOpen,
        setChangeRequestDialogStartMilestoneOpen,
    ] = useState(false);
    const [
        milestoneForChangeRequestDialog,
        setMilestoneForChangeRequestDialog,
    ] = useState<IReleasePlanMilestone>();
    const { isChangeRequestConfigured } = useChangeRequestsEnabled(projectId);
    const { addChange } = useChangeRequestApi();
    const { refetch: refetchChangeRequests } =
        usePendingChangeRequests(projectId);
    const milestoneProgressionsEnabled = useUiFlag('milestoneProgression');
    const [progressionFormOpenIndex, setProgressionFormOpenIndex] = useState<
        number | null
    >(null);

    const onAddRemovePlanChangesConfirm = async () => {
        await addChange(projectId, environment, {
            feature: featureName,
            action: 'deleteReleasePlan',
            payload: {
                planId: plan.id,
            },
        });

        await refetchChangeRequests();

        setToastData({
            type: 'success',
            text: 'Added to draft',
        });

        setChangeRequestDialogRemoveOpen(false);
    };

    const onAddStartMilestoneChangesConfirm = async () => {
        await addChange(projectId, environment, {
            feature: featureName,
            action: 'startMilestone',
            payload: {
                planId: plan.id,
                milestoneId: milestoneForChangeRequestDialog?.id,
            },
        });

        await refetchChangeRequests();

        setToastData({
            type: 'success',
            text: 'Added to draft',
        });

        setChangeRequestDialogStartMilestoneOpen(false);
    };

    const confirmRemoveReleasePlan = () => {
        if (isChangeRequestConfigured(environment)) {
            setChangeRequestDialogRemoveOpen(true);
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
            setMilestoneForChangeRequestDialog(milestone);
            setChangeRequestDialogStartMilestoneOpen(true);
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
                                automationForm={
                                    isProgressionFormOpen ? (
                                        <MilestoneProgressionForm
                                            sourceMilestoneId={milestone.id}
                                            targetMilestoneId={nextMilestoneId}
                                            projectId={projectId}
                                            environment={environment}
                                            onSave={handleProgressionSave}
                                            onCancel={handleProgressionCancel}
                                        />
                                    ) : undefined
                                }
                            />
                            <ConditionallyRender
                                condition={isNotLastMilestone}
                                show={<StyledConnection />}
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
            <RemoveReleasePlanChangeRequestDialog
                environmentId={environment}
                featureId={featureName}
                isOpen={changeRequestDialogRemoveOpen}
                onConfirm={onAddRemovePlanChangesConfirm}
                onClosing={() => setChangeRequestDialogRemoveOpen(false)}
                releasePlan={plan}
                environmentActive={!environmentIsDisabled}
            />
            <StartMilestoneChangeRequestDialog
                environmentId={environment}
                featureId={featureName}
                isOpen={changeRequestDialogStartMilestoneOpen}
                onConfirm={onAddStartMilestoneChangesConfirm}
                onClosing={() => {
                    setMilestoneForChangeRequestDialog(undefined);
                    setChangeRequestDialogStartMilestoneOpen(false);
                }}
                releasePlan={plan}
                milestone={milestoneForChangeRequestDialog}
            />
        </StyledContainer>
    );
};
