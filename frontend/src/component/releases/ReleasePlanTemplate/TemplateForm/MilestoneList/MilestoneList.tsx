import { createUuid } from 'utils/createUuid';
import type { IReleasePlanMilestonePayload } from 'interfaces/releasePlans';
import { styled, Button } from '@mui/material';
import Add from '@mui/icons-material/Add';
import { Fragment, useCallback } from 'react';
import type { OnMoveItem } from 'hooks/useDragItem';
import { MilestoneCard } from './MilestoneCard/MilestoneCard.tsx';
import { MilestoneAutomationForm } from './MilestoneCard/MilestoneAutomationForm.tsx';
import { automationErrorKey } from 'component/releases/hooks/useTemplateForm';
import { isValidAutomation } from 'component/feature/FeatureView/FeatureOverview/ReleasePlan/utils/isValidAutomation';
import { useUiFlag } from 'hooks/useUiFlag.ts';

interface IMilestoneListProps {
    milestones: IReleasePlanMilestonePayload[];
    setMilestones: React.Dispatch<
        React.SetStateAction<IReleasePlanMilestonePayload[]>
    >;
    errors: { [key: string]: string };
    clearErrors: () => void;
    clearError: (key: string) => void;
    milestoneChanged: (milestone: IReleasePlanMilestonePayload) => void;
}

const StyledAddMilestoneButton = styled(Button)(({ theme }) => ({
    marginTop: theme.spacing(1),
    maxWidth: theme.spacing(20),
}));

export const MilestoneList = ({
    milestones,
    setMilestones,
    errors,
    clearErrors,
    clearError,
    milestoneChanged,
}: IMilestoneListProps) => {
    const templatesAutomationsEnabled = useUiFlag(
        'releaseTemplatesAutomations',
    );
    const onMoveItem: OnMoveItem = useCallback(
        async ({ dragIndex, dropIndex, event, draggedElement }) => {
            if (event.type === 'drop') {
                return; // the user has let go, we should leave the current sort order as it is currently visually displayed
            }

            if (event.type === 'dragenter' && dragIndex !== dropIndex) {
                const target = event.target as HTMLElement;

                const draggedElementHeight =
                    draggedElement.getBoundingClientRect().height;

                const { top, bottom } = target.getBoundingClientRect();
                const overTargetTop =
                    event.clientY - top < draggedElementHeight;
                const overTargetBottom =
                    bottom - event.clientY < draggedElementHeight;
                const draggingUp = dragIndex > dropIndex;

                // prevent oscillating by only reordering if there is sufficient space
                const shouldReorder = draggingUp
                    ? overTargetTop
                    : overTargetBottom;

                if (shouldReorder) {
                    const oldMilestones = milestones || [];
                    const newMilestones = [...oldMilestones];
                    const movedMilestone = newMilestones.splice(
                        dragIndex,
                        1,
                    )[0];
                    newMilestones.splice(dropIndex, 0, movedMilestone);

                    newMilestones.forEach((milestone, index) => {
                        milestone.sortOrder = index;
                    });

                    setMilestones(newMilestones);
                }
            }
        },
        [milestones],
    );

    const onDeleteMilestone = (milestoneId: string) => () => {
        setMilestones((prev) =>
            prev
                .filter((m) => m.id !== milestoneId)
                .map((m, i) => ({ ...m, sortOrder: i })),
        );
    };

    return (
        <>
            {milestones.map((milestone, index) => {
                const isLast = index === milestones.length - 1;
                return (
                    <Fragment key={milestone.id}>
                        <MilestoneCard
                            index={index}
                            onMoveItem={onMoveItem}
                            milestone={milestone}
                            milestoneChanged={milestoneChanged}
                            errors={errors}
                            clearErrors={clearErrors}
                            removable={milestones.length > 1}
                            onDeleteMilestone={onDeleteMilestone(milestone.id)}
                        />
                        {templatesAutomationsEnabled && !isLast ? (
                            <MilestoneAutomationForm
                                milestoneName={milestone.name}
                                transitionCondition={
                                    milestone.transitionCondition
                                }
                                onChange={(transitionCondition) => {
                                    if (
                                        !transitionCondition ||
                                        isValidAutomation(transitionCondition)
                                    ) {
                                        clearError(
                                            automationErrorKey(milestone.id),
                                        );
                                    }
                                    milestoneChanged({
                                        ...milestone,
                                        transitionCondition,
                                    });
                                }}
                                error={
                                    errors?.[automationErrorKey(milestone.id)]
                                }
                            />
                        ) : null}
                    </Fragment>
                );
            })}
            <StyledAddMilestoneButton
                variant='text'
                color='primary'
                startIcon={<Add />}
                onClick={() =>
                    setMilestones((prev) => [
                        ...prev,
                        {
                            id: createUuid(),
                            name: `Milestone ${prev.length + 1}`,
                            sortOrder: prev.length,
                            strategies: prev[prev.length - 1].strategies?.map(
                                (strat) => {
                                    return {
                                        ...strat,
                                        id: createUuid(),
                                    };
                                },
                            ),
                            startExpanded: true,
                        },
                    ])
                }
            >
                Add milestone
            </StyledAddMilestoneButton>
        </>
    );
};
