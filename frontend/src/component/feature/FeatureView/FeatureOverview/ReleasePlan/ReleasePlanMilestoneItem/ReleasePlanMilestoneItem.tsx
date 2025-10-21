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

    // Automation-related
    milestoneProgressionsEnabled: boolean;
    progressionFormOpenIndex: number | null;
    onSetProgressionFormOpenIndex: (index: number | null) => void;

    // API callbacks
    onStartMilestone?: (milestone: IReleasePlanMilestone) => void;
    onDeleteProgression: (milestone: IReleasePlanMilestone) => void;
    onProgressionSave: () => Promise<void>;
    onProgressionChangeRequestSubmit: (
        payload: CreateMilestoneProgressionSchema,
    ) => void;
    onUpdateProgressionChangeRequestSubmit: (
        sourceMilestoneId: string,
        payload: UpdateMilestoneProgressionSchema,
    ) => void;

    // Context
    getPendingProgressionChange: (
        sourceMilestoneId: string,
    ) => PendingProgressionChange | null;

    // IDs
    projectId: string;
    environment: string;
    featureName: string;

    onUpdate: () => void;
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
    onProgressionSave,
    onProgressionChangeRequestSubmit,
    onUpdateProgressionChangeRequestSubmit,
    getPendingProgressionChange,
    projectId,
    environment,
    featureName,
    onUpdate,
}: IReleasePlanMilestoneItemProps) => {
    const isNotLastMilestone = index < milestones.length - 1;
    const isProgressionFormOpen = progressionFormOpenIndex === index;
    const nextMilestoneId = milestones[index + 1]?.id || '';
    const handleOpenProgressionForm = () => onSetProgressionFormOpenIndex(index);
    const handleCloseProgressionForm = () => onSetProgressionFormOpenIndex(null);

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
                    projectId={projectId}
                    environment={environment}
                    featureName={featureName}
                    onSave={onProgressionSave}
                    onCancel={handleCloseProgressionForm}
                    onChangeRequestSubmit={(payload) =>
                        onProgressionChangeRequestSubmit(payload)
                    }
                />
            ) : effectiveTransitionCondition ? (
                <MilestoneTransitionDisplay
                    intervalMinutes={effectiveTransitionCondition.intervalMinutes}
                    onDelete={() => onDeleteProgression(milestone)}
                    milestoneName={milestone.name}
                    status={status}
                    projectId={projectId}
                    environment={environment}
                    featureName={featureName}
                    sourceMilestoneId={milestone.id}
                    onUpdate={onUpdate}
                    onChangeRequestSubmit={onUpdateProgressionChangeRequestSubmit}
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
