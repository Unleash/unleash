import type { IReleasePlanMilestonePayload } from 'interfaces/releasePlans';
import { styled, Button } from '@mui/material';
import Add from '@mui/icons-material/Add';
import { v4 as uuidv4 } from 'uuid';
import { useCallback } from 'react';
import type { OnMoveItem } from 'hooks/useDragItem';
import { MilestoneCard as LegacyMilestoneCard } from './MilestoneCard/LegacyMilestoneCard';
import { useUiFlag } from 'hooks/useUiFlag';
import { MilestoneCard } from './MilestoneCard/MilestoneCard';

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
    const useNewMilestoneCard = useUiFlag('flagOverviewRedesign');
    const onMoveItem: OnMoveItem = useCallback(
        async (dragIndex: number, dropIndex: number, save?: boolean) => {
            if (useNewMilestoneCard && save) {
                return; // the user has let go, we should leave the current sort order as it is currently visually displayed
            }

            if (dragIndex !== dropIndex) {
                // todo! See if there's a way to make this snippet to stabilize dragging before removing flag `flagOverviewRedesign`
                // We don't have a reference to `ref` or `event` here, but maybe we can make it work? Somehow?

                // const { top, bottom } = ref.current.getBoundingClientRect();
                // const overTargetTop = event.clientY - top < dragItem.height;
                // const overTargetBottom =
                //     bottom - event.clientY < dragItem.height;
                // const draggingUp = dragItem.index > targetIndex;

                // // prevent oscillating by only reordering if there is sufficient space
                // if (
                //     (overTargetTop && draggingUp) ||
                //     (overTargetBottom && !draggingUp)
                // ) {
                //     // reorder here
                // }
                const oldMilestones = milestones || [];
                const newMilestones = [...oldMilestones];
                const movedMilestone = newMilestones.splice(dragIndex, 1)[0];
                newMilestones.splice(dropIndex, 0, movedMilestone);

                newMilestones.forEach((milestone, index) => {
                    milestone.sortOrder = index;
                });

                setMilestones(newMilestones);
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

    const Card = useNewMilestoneCard ? MilestoneCard : LegacyMilestoneCard;

    return (
        <>
            {milestones.map((milestone, index) => (
                <Card
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
                            id: uuidv4(),
                            name: `Milestone ${prev.length + 1}`,
                            sortOrder: prev.length,
                            strategies: prev[prev.length - 1].strategies?.map(
                                (strat) => {
                                    return {
                                        ...strat,
                                        id: uuidv4(),
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
