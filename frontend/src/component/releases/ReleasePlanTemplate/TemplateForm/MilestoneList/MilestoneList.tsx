import type { IReleasePlanMilestonePayload } from 'interfaces/releasePlans';
import { styled, Button } from '@mui/material';
import Add from '@mui/icons-material/Add';
import { useCallback } from 'react';
import type { OnMoveItem } from 'hooks/useDragItem';
import { MilestoneCard } from './MilestoneCard/MilestoneCard.tsx';

interface IMilestoneListProps {
    milestones: IReleasePlanMilestonePayload[];
    setMilestones: React.Dispatch<
        React.SetStateAction<IReleasePlanMilestonePayload[]>
    >;
    errors: { [key: string]: string };
    clearErrors: () => void;
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
    milestoneChanged,
}: IMilestoneListProps) => {
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
            {milestones.map((milestone, index) => (
                <MilestoneCard
                    key={milestone.id}
                    index={index}
                    onMoveItem={onMoveItem}
                    milestone={milestone}
                    milestoneChanged={milestoneChanged}
                    errors={errors}
                    clearErrors={clearErrors}
                    removable={milestones.length > 1}
                    onDeleteMilestone={onDeleteMilestone(milestone.id)}
                />
            ))}
            <StyledAddMilestoneButton
                variant='text'
                color='primary'
                startIcon={<Add />}
                onClick={() =>
                    setMilestones((prev) => [
                        ...prev,
                        {
                            id: crypto.randomUUID(),
                            name: `Milestone ${prev.length + 1}`,
                            sortOrder: prev.length,
                            strategies: prev[prev.length - 1].strategies?.map(
                                (strat) => {
                                    return {
                                        ...strat,
                                        id: crypto.randomUUID(),
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
