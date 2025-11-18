import { styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import type { IReleasePlanMilestone } from 'interfaces/releasePlans';
import type { ChangeMilestoneProgressionSchema } from 'openapi';
import { ReleasePlanMilestone } from '../ReleasePlanMilestone/ReleasePlanMilestone.tsx';
import { useMilestoneProgressionsApi } from 'hooks/api/actions/useMilestoneProgressionsApi/useMilestoneProgressionsApi';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { calculateMilestoneStatus } from './milestoneStatusUtils.js';
import { getPendingProgressionData } from './pendingProgressionChanges.js';
import { MilestoneAutomation } from './MilestoneAutomation.tsx';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker.ts';

const StyledConnection = styled('div', {
    shouldForwardProp: (prop) => prop !== 'isCompleted',
})<{ isCompleted: boolean }>(({ theme, isCompleted }) => ({
    width: 2,
    height: theme.spacing(2),
    backgroundColor: isCompleted
        ? theme.palette.divider
        : theme.palette.primary.main,
    marginLeft: theme.spacing(3.5),
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
    onAddToChangeRequest: (action: {
        type: 'changeMilestoneProgression';
        payload: ChangeMilestoneProgressionSchema;
    }) => void;
    getPendingProgressionChange: (
        sourceMilestoneId: string,
    ) => PendingProgressionChange | null;
    projectId: string;
    environment: string;
    featureName: string;
    onUpdate: () => void | Promise<void>;
}

const getTimeUnit = (intervalMinutes: number): 'minutes' | 'hours' | 'days' => {
    if (intervalMinutes < 60) {
        return 'minutes';
    } else if (intervalMinutes < 1440) {
        return 'hours';
    } else {
        return 'days';
    }
};

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
    const { changeMilestoneProgression } = useMilestoneProgressionsApi();
    const { isChangeRequestConfigured } = useChangeRequestsEnabled(projectId);
    const { setToastData, setToastApiError } = useToast();
    const { trackEvent } = usePlausibleTracker();

    const isNotLastMilestone = index < milestones.length - 1;
    const isProgressionFormOpen = progressionFormOpenIndex === index;
    const nextMilestoneId = milestones[index + 1]?.id || '';
    const handleOpenProgressionForm = () =>
        onSetProgressionFormOpenIndex(index);
    const handleCloseProgressionForm = () =>
        onSetProgressionFormOpenIndex(null);

    const handleChangeProgression = async (
        payload: ChangeMilestoneProgressionSchema,
    ): Promise<{ shouldReset?: boolean }> => {
        trackEvent('release-management', {
            props: {
                eventType: 'change-progression',
                transitionUnit: getTimeUnit(
                    payload.transitionCondition.intervalMinutes,
                ),
            },
        });
        if (isChangeRequestConfigured(environment)) {
            onAddToChangeRequest({
                type: 'changeMilestoneProgression',
                payload: {
                    ...payload,
                    sourceMilestone: milestone.id,
                },
            });
            handleCloseProgressionForm();
            return {};
        }

        try {
            await changeMilestoneProgression(
                projectId,
                environment,
                featureName,
                milestone.id,
                payload,
            );
            setToastData({
                type: 'success',
                text: 'Automation configured successfully',
            });
            handleCloseProgressionForm();
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
        milestones,
    );

    const { pendingProgressionChange, effectiveTransitionCondition } =
        getPendingProgressionData(milestone, getPendingProgressionChange);

    const shouldShowAutomation =
        isNotLastMilestone && milestoneProgressionsEnabled && !readonly;

    const automationSection = shouldShowAutomation ? (
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
            onChangeProgression={handleChangeProgression}
            onDeleteProgression={onDeleteProgression}
        />
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
