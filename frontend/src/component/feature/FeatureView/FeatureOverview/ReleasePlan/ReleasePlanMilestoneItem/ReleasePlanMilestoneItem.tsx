import { styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import type { IReleasePlanMilestone } from 'interfaces/releasePlans';
import type {
    CreateMilestoneProgressionSchema,
    UpdateMilestoneProgressionSchema,
} from 'openapi';
import { ReleasePlanMilestone } from '../ReleasePlanMilestone/ReleasePlanMilestone.tsx';
import { useMilestoneProgressionsApi } from 'hooks/api/actions/useMilestoneProgressionsApi/useMilestoneProgressionsApi';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { calculateMilestoneStatus } from './milestoneStatusUtils';
import { usePendingProgressionChanges } from './usePendingProgressionChanges';
import { MilestoneAutomation } from './MilestoneAutomation';

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

export interface PendingProgressionChange {
    action: string;
    payload: any;
    changeRequestId: number;
}

export interface IReleasePlanMilestoneItemProps {
    milestone: IReleasePlanMilestone;
    index: number;
    milestones: IReleasePlanMilestone[];
    activeMilestoneId?: string;
    activeIndex: number;
    environmentIsDisabled?: boolean;
    readonly?: boolean;
    milestoneProgressionsEnabled: boolean;
    progressionFormOpenIndex: number | null;
    onSetProgressionFormOpenIndex: (index: number | null) => void;
    onStartMilestone?: (milestone: IReleasePlanMilestone) => void;
    onDeleteProgression: (milestone: IReleasePlanMilestone) => void;
    onAddToChangeRequest: (
        action:
            | {
                  type: 'createMilestoneProgression';
                  payload: CreateMilestoneProgressionSchema;
              }
            | {
                  type: 'updateMilestoneProgression';
                  sourceMilestoneId: string;
                  payload: UpdateMilestoneProgressionSchema;
              },
    ) => void;
    getPendingProgressionChange: (
        sourceMilestoneId: string,
    ) => PendingProgressionChange | null;
    projectId: string;
    environment: string;
    featureName: string;
    onUpdate: () => void | Promise<void>;
}

export const ReleasePlanMilestoneItem = ({
    milestone,
    index,
    milestones,
    activeMilestoneId,
    activeIndex,
    environmentIsDisabled,
    readonly,
    milestoneProgressionsEnabled,
    progressionFormOpenIndex,
    onSetProgressionFormOpenIndex,
    onStartMilestone,
    onDeleteProgression,
    onAddToChangeRequest,
    getPendingProgressionChange,
    projectId,
    environment,
    featureName,
    onUpdate,
}: IReleasePlanMilestoneItemProps) => {
    const { createMilestoneProgression, updateMilestoneProgression } =
        useMilestoneProgressionsApi();
    const { isChangeRequestConfigured } = useChangeRequestsEnabled(projectId);
    const { setToastData, setToastApiError } = useToast();

    const isNotLastMilestone = index < milestones.length - 1;
    const isProgressionFormOpen = progressionFormOpenIndex === index;
    const nextMilestoneId = milestones[index + 1]?.id || '';
    const handleOpenProgressionForm = () =>
        onSetProgressionFormOpenIndex(index);
    const handleCloseProgressionForm = () =>
        onSetProgressionFormOpenIndex(null);

    const handleCreateProgression = async (
        payload: CreateMilestoneProgressionSchema,
    ) => {
        if (isChangeRequestConfigured(environment)) {
            onAddToChangeRequest({
                type: 'createMilestoneProgression',
                payload,
            });
            handleCloseProgressionForm();
            return;
        }

        try {
            await createMilestoneProgression(
                projectId,
                environment,
                featureName,
                payload,
            );
            setToastData({
                type: 'success',
                text: 'Automation configured successfully',
            });
            handleCloseProgressionForm();
            await onUpdate();
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const handleUpdateProgression = async (
        payload: UpdateMilestoneProgressionSchema,
    ): Promise<{ shouldReset?: boolean }> => {
        if (isChangeRequestConfigured(environment)) {
            onAddToChangeRequest({
                type: 'updateMilestoneProgression',
                sourceMilestoneId: milestone.id,
                payload,
            });
            return { shouldReset: true };
        }

        try {
            await updateMilestoneProgression(
                projectId,
                environment,
                featureName,
                milestone.id,
                payload,
            );
            setToastData({
                type: 'success',
                text: 'Automation updated successfully',
            });
            await onUpdate();
            return {};
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
            return {};
        }
    };

    const status = calculateMilestoneStatus(
        milestone,
        activeMilestoneId,
        index,
        activeIndex,
        environmentIsDisabled,
    );

    const { pendingProgressionChange, effectiveTransitionCondition } =
        usePendingProgressionChanges(milestone, getPendingProgressionChange);

    const automationSection = (
        <MilestoneAutomation
            milestone={milestone}
            status={status}
            isNotLastMilestone={isNotLastMilestone}
            nextMilestoneId={nextMilestoneId}
            milestoneProgressionsEnabled={milestoneProgressionsEnabled}
            readonly={readonly}
            isProgressionFormOpen={isProgressionFormOpen}
            effectiveTransitionCondition={effectiveTransitionCondition}
            pendingProgressionChange={pendingProgressionChange}
            onOpenProgressionForm={handleOpenProgressionForm}
            onCloseProgressionForm={handleCloseProgressionForm}
            onCreateProgression={handleCreateProgression}
            onUpdateProgression={handleUpdateProgression}
            onDeleteProgression={onDeleteProgression}
        />
    );

    return (
        <div key={milestone.id}>
            <ReleasePlanMilestone
                readonly={readonly}
                milestone={milestone}
                status={status}
                onStartMilestone={onStartMilestone}
                automationSection={automationSection}
                allMilestones={milestones}
                activeMilestoneId={activeMilestoneId}
            />
            <ConditionallyRender
                condition={isNotLastMilestone}
                show={<StyledConnection isCompleted={index < activeIndex} />}
            />
        </div>
    );
};
