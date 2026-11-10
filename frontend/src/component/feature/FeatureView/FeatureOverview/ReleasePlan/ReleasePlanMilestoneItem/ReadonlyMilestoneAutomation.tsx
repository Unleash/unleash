import type { TransitionConditionSchema } from 'openapi';
import { MilestoneAutomationSection } from '../ReleasePlanMilestone/MilestoneAutomationSection.tsx';
import { ReadonlyMilestoneTransitionDisplay } from '../ReleasePlanMilestone/MilestoneTransitionDisplay.tsx';
import type { MilestoneStatus } from '../ReleasePlanMilestone/ReleasePlanMilestoneStatus.tsx';

interface ReadonlyMilestoneAutomationProps {
    transitionCondition: TransitionConditionSchema;
    status: MilestoneStatus;
    environment: string;
    featureName: string;
}

export const ReadonlyMilestoneAutomation = ({
    transitionCondition,
    status,
    environment,
    featureName,
}: ReadonlyMilestoneAutomationProps) => (
    <MilestoneAutomationSection status={status}>
        <ReadonlyMilestoneTransitionDisplay
            transitionCondition={transitionCondition}
            status={status}
            environment={environment}
            featureName={featureName}
        />
    </MilestoneAutomationSection>
);
