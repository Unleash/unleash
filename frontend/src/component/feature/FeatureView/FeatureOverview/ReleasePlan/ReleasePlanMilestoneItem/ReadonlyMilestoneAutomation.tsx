import type { TransitionConditionSchema } from 'openapi';
import { MilestoneAutomationSection } from '../ReleasePlanMilestone/MilestoneAutomationSection.tsx';
import { ReadonlyMilestoneTransitionDisplay } from '../ReleasePlanMilestone/MilestoneTransitionDisplay.tsx';
import type { MilestoneStatus } from '../ReleasePlanMilestone/ReleasePlanMilestoneStatus.tsx';

interface ReadonlyMilestoneAutomationProps {
    transitionCondition: TransitionConditionSchema;
    status: MilestoneStatus;
}

export const ReadonlyMilestoneAutomation = ({
    transitionCondition,
    status,
}: ReadonlyMilestoneAutomationProps) => (
    <MilestoneAutomationSection status={status}>
        <ReadonlyMilestoneTransitionDisplay
            transitionCondition={transitionCondition}
            status={status}
        />
    </MilestoneAutomationSection>
);
