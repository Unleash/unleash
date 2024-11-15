import type { IReleasePlanMilestonePayload } from 'interfaces/releasePlans';
import { useState } from 'react';
import { MilestoneCard } from './MilestoneCard';

interface IMilestoneList {
    milestones: IReleasePlanMilestonePayload[];
    setAddStrategyOpen: (open: boolean) => void;
    errors: { [key: string]: string };
    clearErrors: () => void;
}

export const MilestoneList = ({
    milestones,
    setAddStrategyOpen,
    errors,
    clearErrors,
}: IMilestoneList) => {
    const [currentMilestone, setCurrentMilestone] = useState<number>(-1);

    const showAddStrategyDialog = (index: number) => {
        setCurrentMilestone(index);
        setAddStrategyOpen(true);
    };

    return (
        <>
            {milestones.map((milestone, index) => (
                <MilestoneCard
                    key={`milestone_${index.toString()}`}
                    index={index}
                    milestone={milestone}
                    showAddStrategyDialog={showAddStrategyDialog}
                    errors={errors}
                    clearErrors={clearErrors}
                />
            ))}
        </>
    );
};
