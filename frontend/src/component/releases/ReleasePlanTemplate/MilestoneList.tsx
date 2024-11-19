import type { IReleasePlanMilestonePayload } from 'interfaces/releasePlans';
import { useState } from 'react';
import { MilestoneCard } from './MilestoneCard';
import { styled } from '@mui/material';
import { Button } from '@mui/material';
import Add from '@mui/icons-material/Add';

interface IMilestoneListProps {
    milestones: IReleasePlanMilestonePayload[];
    setMilestones: React.Dispatch<
        React.SetStateAction<IReleasePlanMilestonePayload[]>
    >;
    setAddStrategyOpen: (open: boolean) => void;
    errors: { [key: string]: string };
    clearErrors: () => void;
}

const StyledAddMilestoneButton = styled(Button)(({ theme }) => ({
    marginTop: theme.spacing(1),
    maxWidth: theme.spacing(20),
}));

export const MilestoneList = ({
    milestones,
    setMilestones,
    setAddStrategyOpen,
    errors,
    clearErrors,
}: IMilestoneList) => {
    const [currentMilestone, setCurrentMilestone] = useState(-1);

    const showAddStrategyDialog = (index: number) => {
        setCurrentMilestone(index);
        setAddStrategyOpen(true);
    };

    const milestoneNameChanged = (index: number, name: string) => {
        setMilestones((prev) =>
            prev.map((milestone, i) =>
                i === index ? { ...milestone, name } : milestone,
            ),
        );
    };

    return (
        <>
            {milestones.map((milestone, index) => (
                <MilestoneCard
                    key={`milestone_${index.toString()}`}
                    index={index}
                    milestone={milestone}
                    milestoneNameChanged={milestoneNameChanged}
                    showAddStrategyDialog={showAddStrategyDialog}
                    errors={errors}
                    clearErrors={clearErrors}
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
