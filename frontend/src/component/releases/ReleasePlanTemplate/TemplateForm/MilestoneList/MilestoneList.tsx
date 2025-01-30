import type { IReleasePlanMilestonePayload } from 'interfaces/releasePlans';
import { styled, Button } from '@mui/material';
import Add from '@mui/icons-material/Add';
import { v4 as uuidv4 } from 'uuid';
import { useCallback } from 'react';
import type { MoveListItem } from 'hooks/useDragItem';
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
    const moveListItem: MoveListItem = useCallback(
        async (dragIndex: number, dropIndex: number) => {
            const oldMilestones = milestones || [];
            const newMilestones = [...oldMilestones];
            const movedMilestone = newMilestones.splice(dragIndex, 1)[0];
            newMilestones.splice(dropIndex, 0, movedMilestone);

            newMilestones.forEach((milestone, index) => {
                milestone.sortOrder = index;
            });

            setMilestones(newMilestones);
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
                    moveListItem={moveListItem}
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
                        },
                    ])
                }
            >
                Add milestone
            </StyledAddMilestoneButton>
        </>
    );
};
