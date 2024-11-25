import type {
    IReleasePlanMilestonePayload,
    IReleasePlanMilestoneStrategy,
} from 'interfaces/releasePlans';
import { MilestoneCard } from './MilestoneCard';
import { styled } from '@mui/material';
import { Button } from '@mui/material';
import Add from '@mui/icons-material/Add';
import { v4 as uuidv4 } from 'uuid';

interface IMilestoneListProps {
    milestones: IReleasePlanMilestonePayload[];
    setMilestones: React.Dispatch<
        React.SetStateAction<IReleasePlanMilestonePayload[]>
    >;
    openAddStrategyForm: (
        milestoneId: string,
        strategy: IReleasePlanMilestoneStrategy,
    ) => void;
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
    openAddStrategyForm,
    errors,
    clearErrors,
}: IMilestoneListProps) => {
    const milestoneNameChanged = (milestoneId: string, name: string) => {
        setMilestones((prev) =>
            prev.map((milestone) =>
                milestone.id === milestoneId
                    ? { ...milestone, name }
                    : milestone,
            ),
        );
    };

    return (
        <>
            {milestones.map((milestone) => (
                <MilestoneCard
                    key={milestone.id}
                    milestone={milestone}
                    milestoneNameChanged={milestoneNameChanged}
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
