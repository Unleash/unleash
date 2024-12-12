import type {
    IReleasePlanMilestonePayload,
    IReleasePlanMilestoneStrategy,
} from 'interfaces/releasePlans';
import { MilestoneCard } from './MilestoneCard';
import { styled, Button } from '@mui/material';
import Add from '@mui/icons-material/Add';
import { v4 as uuidv4 } from 'uuid';

interface IMilestoneListProps {
    milestones: IReleasePlanMilestonePayload[];
    setMilestones: React.Dispatch<
        React.SetStateAction<IReleasePlanMilestonePayload[]>
    >;
    openAddStrategyForm: (
        milestoneId: string,
        strategy: Omit<IReleasePlanMilestoneStrategy, 'milestoneId'>,
        editing: boolean,
    ) => void;
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
    openAddStrategyForm,
    errors,
    clearErrors,
    milestoneChanged,
}: IMilestoneListProps) => {
    return (
        <>
            {milestones.map((milestone) => (
                <MilestoneCard
                    key={milestone.id}
                    milestone={milestone}
                    milestoneChanged={milestoneChanged}
                    showAddStrategyDialog={openAddStrategyForm}
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
