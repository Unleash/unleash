import Delete from '@mui/icons-material/Delete';
import { styled } from '@mui/material';
import { DELETE_FEATURE_STRATEGY } from '@server/types/permissions';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import { useReleasePlansApi } from 'hooks/api/actions/useReleasePlansApi/useReleasePlansApi';
import { useReleasePlans } from 'hooks/api/getters/useReleasePlans/useReleasePlans';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import useToast from 'hooks/useToast';
import type {
    IReleasePlan,
    IReleasePlanMilestone,
} from 'interfaces/releasePlans';
import { useState } from 'react';
import { formatUnknownError } from 'utils/formatUnknownError';
import { ReleasePlanRemoveDialog } from './ReleasePlanRemoveDialog';
import { ReleasePlanMilestone } from './ReleasePlanMilestone/LegacyReleasePlanMilestone';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';
import { useUiFlag } from 'hooks/useUiFlag';
import { useChangeRequestApi } from 'hooks/api/actions/useChangeRequestApi/useChangeRequestApi';
import { usePendingChangeRequests } from 'hooks/api/getters/usePendingChangeRequests/usePendingChangeRequests';
import { RemoveReleasePlanChangeRequestDialog } from './ChangeRequest/RemoveReleasePlanChangeRequestDialog';
import { StartMilestoneChangeRequestDialog } from './ChangeRequest/StartMilestoneChangeRequestDialog';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { Truncator } from 'component/common/Truncator/Truncator';

const StyledContainer = styled('div', {
    shouldForwardProp: (prop) => prop !== 'readonly',
})<{ readonly?: boolean }>(({ theme, readonly }) => ({
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadiusMedium,
    '& + &': {
        marginTop: theme.spacing(2),
    },
    background: readonly
        ? theme.palette.background.elevation1
        : theme.palette.background.paper,
}));

const StyledHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    color: theme.palette.text.primary,
}));

const StyledHeaderTitleContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: theme.spacing(1),
}));

const StyledHeaderTitleLabel = styled('span')(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    lineHeight: 0.5,
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(0.5),
}));

const StyledHeaderDescription = styled('span')(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    color: theme.palette.text.secondary,
}));

const StyledBody = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    marginTop: theme.spacing(3),
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
    const { refetch } = useReleasePlans(projectId, featureName, environment);
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

    const releasePlanChangeRequestsEnabled = useUiFlag(
        'releasePlanChangeRequests',
    );

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
        if (
            releasePlanChangeRequestsEnabled &&
            isChangeRequestConfigured(environment)
        ) {
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
        if (
            releasePlanChangeRequestsEnabled &&
            isChangeRequestConfigured(environment)
        ) {
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

    const activeIndex = milestones.findIndex(
        (milestone) => milestone.id === activeMilestoneId,
    );

    return (
        <StyledContainer readonly={readonly}>
            <StyledHeader>
                <StyledHeaderTitleContainer>
                    <StyledHeaderTitleLabel>
                        Release plan
                    </StyledHeaderTitleLabel>
                    <span>{name}</span>
                    <StyledHeaderDescription>
                        <Truncator lines={2} title={description}>
                            {description}
                        </Truncator>
                    </StyledHeaderDescription>
                </StyledHeaderTitleContainer>
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
                        />
                        <ConditionallyRender
                            condition={index < milestones.length - 1}
                            show={<StyledConnection />}
                        />
                    </div>
                ))}
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
