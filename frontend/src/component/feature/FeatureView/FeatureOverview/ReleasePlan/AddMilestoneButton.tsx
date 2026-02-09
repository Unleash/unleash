import { useState } from 'react';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import { CREATE_FEATURE_STRATEGY } from 'component/providers/AccessProvider/permissions';
import { useReleasePlansApi } from 'hooks/api/actions/useReleasePlansApi/useReleasePlansApi';
import { useChangeRequestApi } from 'hooks/api/actions/useChangeRequestApi/useChangeRequestApi';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';
import { usePendingChangeRequests } from 'hooks/api/getters/usePendingChangeRequests/usePendingChangeRequests';
import { useFeatureReleasePlans } from 'hooks/api/getters/useFeatureReleasePlans/useFeatureReleasePlans';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { AddMilestoneDialog } from './AddMilestoneDialog';
import type { IReleasePlan } from 'interfaces/releasePlans';
import type { ButtonProps } from '@mui/material';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { useUiFlag } from 'hooks/useUiFlag';

interface IAddMilestoneButtonProps {
    projectId: string;
    featureId: string;
    environmentId: string;
    releasePlan?: IReleasePlan;
    onMilestoneAdded?: () => void;
    variant?: ButtonProps['variant'];
    matchWidth?: boolean;
}

export const AddMilestoneButton = ({
    projectId,
    featureId,
    environmentId,
    releasePlan,
    onMilestoneAdded,
    variant = 'outlined',
    matchWidth = false,
}: IAddMilestoneButtonProps) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { setToastData, setToastApiError } = useToast();
    const { isChangeRequestConfigured } = useChangeRequestsEnabled(projectId);
    const { addChange } = useChangeRequestApi();
    const { refetch: refetchChangeRequests } =
        usePendingChangeRequests(projectId);
    const { refetch: refetchReleasePlans, releasePlans } =
        useFeatureReleasePlans(projectId, featureId, environmentId);
    const { createReleasePlanWithMilestone, addMilestoneToReleasePlan } =
        useReleasePlansApi();
    const { trackEvent } = usePlausibleTracker();

    const crProtected = isChangeRequestConfigured(environmentId);
    const existingReleasePlan = releasePlan || releasePlans[0];
    const existingMilestoneCount = existingReleasePlan?.milestones?.length ?? 0;

    const handleAddMilestone = async (milestoneName: string) => {
        try {
            if (crProtected) {
                await addChange(projectId, environmentId, {
                    feature: featureId,
                    action: 'addMilestone',
                    payload: {
                        planId: existingReleasePlan?.id,
                        name: milestoneName,
                    },
                });
                setToastData({
                    type: 'success',
                    text: 'Added to draft',
                });
                refetchChangeRequests();
            } else if (existingReleasePlan) {
                await addMilestoneToReleasePlan(
                    projectId,
                    featureId,
                    environmentId,
                    existingReleasePlan.id,
                    milestoneName,
                );
                setToastData({
                    type: 'success',
                    text: 'Milestone added',
                });
                refetchReleasePlans();
            } else {
                await createReleasePlanWithMilestone(
                    projectId,
                    featureId,
                    environmentId,
                    milestoneName,
                );
                setToastData({
                    type: 'success',
                    text: 'Release plan created with milestone',
                });
                refetchReleasePlans();
            }

            trackEvent('release-management', {
                props: {
                    eventType: existingReleasePlan
                        ? 'add-milestone'
                        : 'create-inline-plan',
                    milestone: milestoneName,
                },
            });

            setDialogOpen(false);
            onMilestoneAdded?.();
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    return (
        <>
            <PermissionButton
                permission={CREATE_FEATURE_STRATEGY}
                projectId={projectId}
                environmentId={environmentId}
                onClick={() => setDialogOpen(true)}
                variant={variant}
                sx={{ minWidth: matchWidth ? '282px' : 'auto' }}
            >
                Add milestone
            </PermissionButton>
            <AddMilestoneDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onConfirm={handleAddMilestone}
                existingMilestoneCount={existingMilestoneCount}
            />
        </>
    );
};
