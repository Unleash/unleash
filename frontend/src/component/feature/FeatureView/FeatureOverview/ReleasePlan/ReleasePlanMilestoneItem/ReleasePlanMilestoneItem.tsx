import Add from '@mui/icons-material/Add';
import { Button, styled } from '@mui/material';
import { Badge } from 'component/common/Badge/Badge';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import type { IReleasePlanMilestone } from 'interfaces/releasePlans';
import type {
    CreateMilestoneProgressionSchema,
    UpdateMilestoneProgressionSchema,
} from 'openapi';
import { MilestoneAutomationSection } from '../ReleasePlanMilestone/MilestoneAutomationSection.tsx';
import { MilestoneTransitionDisplay } from '../ReleasePlanMilestone/MilestoneTransitionDisplay.tsx';
import { ReleasePlanMilestone } from '../ReleasePlanMilestone/ReleasePlanMilestone.tsx';
import type { MilestoneStatus } from '../ReleasePlanMilestone/ReleasePlanMilestoneStatus.tsx';
import { MilestoneProgressionForm } from '../MilestoneProgressionForm/MilestoneProgressionForm.tsx';
import { useMilestoneProgressionsApi } from 'hooks/api/actions/useMilestoneProgressionsApi/useMilestoneProgressionsApi';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';

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

const StyledAddAutomationButton = styled(Button)(({ theme }) => ({
    textTransform: 'none',
    fontWeight: theme.typography.fontWeightBold,
    fontSize: theme.typography.body2.fontSize,
    padding: 0,
    minWidth: 'auto',
    gap: theme.spacing(1),
    '&:hover': {
        backgroundColor: 'transparent',
    },
    '& .MuiButton-startIcon': {
        margin: 0,
        width: 20,
        height: 20,
        border: `1px solid ${theme.palette.primary.main}`,
        backgroundColor: theme.palette.background.elevation2,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '& svg': {
            fontSize: 14,
            color: theme.palette.primary.main,
        },
    },
}));

const StyledAddAutomationContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

interface PendingProgressionChange {
    action: string;
    payload: any;
    changeRequestId: number;
}

interface IReleasePlanMilestoneItemProps {
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

    const status: MilestoneStatus =
        milestone.id === activeMilestoneId
            ? environmentIsDisabled
                ? 'paused'
                : 'active'
            : index < activeIndex
              ? 'completed'
              : 'not-started';

    // Calculate pending progression change for this milestone
    const pendingProgressionChange = getPendingProgressionChange(milestone.id);
    const hasPendingCreate =
        pendingProgressionChange?.action === 'createMilestoneProgression';
    const hasPendingUpdate =
        pendingProgressionChange?.action === 'updateMilestoneProgression';
    const hasPendingDelete =
        pendingProgressionChange?.action === 'deleteMilestoneProgression';

    // Determine effective transition condition (use pending create if exists)
    let effectiveTransitionCondition = milestone.transitionCondition;
    if (
        pendingProgressionChange?.action === 'createMilestoneProgression' &&
        'transitionCondition' in pendingProgressionChange.payload &&
        pendingProgressionChange.payload.transitionCondition
    ) {
        effectiveTransitionCondition =
            pendingProgressionChange.payload.transitionCondition;
    }

    // Build automation section
    const showAutomation =
        milestoneProgressionsEnabled && isNotLastMilestone && !readonly;
    const automationSection = showAutomation ? (
        <MilestoneAutomationSection status={status}>
            {isProgressionFormOpen ? (
                <MilestoneProgressionForm
                    sourceMilestoneId={milestone.id}
                    targetMilestoneId={nextMilestoneId}
                    onSubmit={handleCreateProgression}
                    onCancel={handleCloseProgressionForm}
                />
            ) : effectiveTransitionCondition ? (
                <MilestoneTransitionDisplay
                    intervalMinutes={
                        effectiveTransitionCondition.intervalMinutes
                    }
                    onSave={handleUpdateProgression}
                    onDelete={() => onDeleteProgression(milestone)}
                    milestoneName={milestone.name}
                    status={status}
                    hasPendingUpdate={hasPendingUpdate}
                    hasPendingDelete={hasPendingDelete}
                />
            ) : (
                <StyledAddAutomationContainer>
                    <StyledAddAutomationButton
                        onClick={handleOpenProgressionForm}
                        color='primary'
                        startIcon={<Add />}
                    >
                        Add automation
                    </StyledAddAutomationButton>
                    {hasPendingCreate && (
                        <Badge color='warning'>Modified in draft</Badge>
                    )}
                </StyledAddAutomationContainer>
            )}
        </MilestoneAutomationSection>
    ) : undefined;

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
