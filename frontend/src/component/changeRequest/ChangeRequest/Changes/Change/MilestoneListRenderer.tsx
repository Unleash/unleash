import { styled } from '@mui/material';
import type { IReleasePlan } from 'interfaces/releasePlans';
import type { UpdateMilestoneProgressionSchema } from 'openapi';
import type { ChangeRequestState } from 'component/changeRequest/changeRequest.types';
import { ReleasePlanMilestone } from 'component/feature/FeatureView/FeatureOverview/ReleasePlan/ReleasePlanMilestone/ReleasePlanMilestone';
import { MilestoneAutomationSection } from 'component/feature/FeatureView/FeatureOverview/ReleasePlan/ReleasePlanMilestone/MilestoneAutomationSection.tsx';
import { MilestoneTransitionDisplay } from 'component/feature/FeatureView/FeatureOverview/ReleasePlan/ReleasePlanMilestone/MilestoneTransitionDisplay.tsx';
import type { MilestoneStatus } from 'component/feature/FeatureView/FeatureOverview/ReleasePlan/ReleasePlanMilestone/ReleasePlanMilestoneStatus.tsx';

const StyledConnection = styled('div')(({ theme }) => ({
    width: 2,
    height: theme.spacing(2),
    backgroundColor: theme.palette.divider,
    marginLeft: theme.spacing(3.25),
}));

interface MilestoneListRendererProps {
    plan: IReleasePlan;
    changeRequestState: ChangeRequestState;
    milestonesWithAutomation?: Set<string>;
    milestonesWithDeletedAutomation?: Set<string>;
    onUpdateAutomation?: (
        sourceMilestoneId: string,
        payload: UpdateMilestoneProgressionSchema,
    ) => Promise<void>;
    onDeleteAutomation?: (sourceMilestoneId: string) => void;
}

export const MilestoneListRenderer = ({
    plan,
    changeRequestState,
    milestonesWithAutomation = new Set(),
    milestonesWithDeletedAutomation = new Set(),
    onUpdateAutomation,
    onDeleteAutomation,
}: MilestoneListRendererProps) => {
    const readonly =
        changeRequestState === 'Applied' || changeRequestState === 'Cancelled';
    const status: MilestoneStatus = 'not-started';

    return (
        <>
            {plan.milestones.map((milestone, index) => {
                const isNotLastMilestone = index < plan.milestones.length - 1;
                const shouldShowAutomation =
                    milestonesWithAutomation.has(milestone.id) ||
                    milestonesWithDeletedAutomation.has(milestone.id);

                const showAutomation =
                    isNotLastMilestone && shouldShowAutomation;

                const hasPendingDelete = milestonesWithDeletedAutomation.has(
                    milestone.id,
                );

                const automationSection =
                    showAutomation && milestone.transitionCondition ? (
                        <MilestoneAutomationSection status={status}>
                            <MilestoneTransitionDisplay
                                intervalMinutes={
                                    milestone.transitionCondition
                                        .intervalMinutes
                                }
                                onSave={async (payload) => {
                                    await onUpdateAutomation?.(
                                        milestone.id,
                                        payload,
                                    );
                                    return { shouldReset: true };
                                }}
                                onDelete={() =>
                                    onDeleteAutomation?.(milestone.id)
                                }
                                milestoneName={milestone.name}
                                status={status}
                                hasPendingUpdate={false}
                                hasPendingDelete={hasPendingDelete}
                            />
                        </MilestoneAutomationSection>
                    ) : undefined;

                return (
                    <div key={milestone.id}>
                        <ReleasePlanMilestone
                            readonly={readonly}
                            milestone={milestone}
                            automationSection={automationSection}
                            allMilestones={plan.milestones}
                            activeMilestoneId={plan.activeMilestoneId}
                        />
                        {isNotLastMilestone && <StyledConnection />}
                    </div>
                );
            })}
        </>
    );
};
