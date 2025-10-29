import { styled } from '@mui/material';
import type { IReleasePlan } from 'interfaces/releasePlans';
import type { ChangeMilestoneProgressionSchema } from 'openapi';
import { ReleasePlanMilestone } from 'component/feature/FeatureView/FeatureOverview/ReleasePlan/ReleasePlanMilestone/ReleasePlanMilestone';
import { MilestoneAutomationSection } from 'component/feature/FeatureView/FeatureOverview/ReleasePlan/ReleasePlanMilestone/MilestoneAutomationSection.tsx';
import {
    MilestoneTransitionDisplay,
    ReadonlyMilestoneTransitionDisplay,
} from 'component/feature/FeatureView/FeatureOverview/ReleasePlan/ReleasePlanMilestone/MilestoneTransitionDisplay.tsx';
import type { MilestoneStatus } from 'component/feature/FeatureView/FeatureOverview/ReleasePlan/ReleasePlanMilestone/ReleasePlanMilestoneStatus.tsx';
import { Badge } from 'component/common/Badge/Badge';

const StyledConnection = styled('div')(({ theme }) => ({
    width: 2,
    height: theme.spacing(2),
    backgroundColor: theme.palette.divider,
    marginLeft: theme.spacing(3.5),
}));

interface MilestoneListRendererCoreProps {
    plan: IReleasePlan;
    readonly: boolean;
    milestonesWithAutomation: Set<string>;
    milestonesWithDeletedAutomation: Set<string>;
    onUpdateAutomation: (
        sourceMilestoneId: string,
        payload: ChangeMilestoneProgressionSchema,
    ) => Promise<void>;
    onDeleteAutomation: (sourceMilestoneId: string) => void;
}

const MilestoneListRendererCore = ({
    plan,
    readonly,
    milestonesWithAutomation,
    milestonesWithDeletedAutomation,
    onUpdateAutomation,
    onDeleteAutomation,
}: MilestoneListRendererCoreProps) => {
    const status: MilestoneStatus = 'not-started';

    return (
        <>
            {plan.milestones.map((milestone, index) => {
                const isNotLastMilestone = index < plan.milestones.length - 1;
                const nextMilestoneId = plan.milestones[index + 1]?.id || '';
                const shouldShowAutomation = readonly
                    ? milestone.transitionCondition !== undefined
                    : milestonesWithAutomation.has(milestone.id) ||
                      milestonesWithDeletedAutomation.has(milestone.id);

                const showAutomation =
                    isNotLastMilestone && shouldShowAutomation;

                const hasPendingDelete = milestonesWithDeletedAutomation.has(
                    milestone.id,
                );
                const hasPendingModification = milestonesWithAutomation.has(
                    milestone.id,
                );

                const badge = hasPendingDelete ? (
                    <Badge color='error'>Deleted in draft</Badge>
                ) : hasPendingModification ? (
                    <Badge color='warning'>Modified in draft</Badge>
                ) : undefined;

                const automationSection =
                    showAutomation && milestone.transitionCondition ? (
                        <MilestoneAutomationSection status={status}>
                            {readonly ? (
                                <ReadonlyMilestoneTransitionDisplay
                                    intervalMinutes={
                                        milestone.transitionCondition
                                            .intervalMinutes
                                    }
                                    status={status}
                                />
                            ) : (
                                <MilestoneTransitionDisplay
                                    intervalMinutes={
                                        milestone.transitionCondition
                                            .intervalMinutes
                                    }
                                    targetMilestoneId={nextMilestoneId}
                                    sourceMilestoneStartedAt={
                                        milestone.startedAt
                                    }
                                    onSave={async (payload) => {
                                        await onUpdateAutomation(
                                            milestone.id,
                                            payload,
                                        );
                                        return { shouldReset: true };
                                    }}
                                    onDelete={() =>
                                        onDeleteAutomation(milestone.id)
                                    }
                                    milestoneName={milestone.name}
                                    status={status}
                                    badge={badge}
                                />
                            )}
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

interface ReadonlyMilestoneListRendererProps {
    plan: IReleasePlan;
    milestonesWithAutomation?: Set<string>;
    milestonesWithDeletedAutomation?: Set<string>;
}

export const ReadonlyMilestoneListRenderer = ({
    plan,
    milestonesWithAutomation = new Set(),
    milestonesWithDeletedAutomation = new Set(),
}: ReadonlyMilestoneListRendererProps) => {
    return (
        <MilestoneListRendererCore
            plan={plan}
            readonly={true}
            milestonesWithAutomation={milestonesWithAutomation}
            milestonesWithDeletedAutomation={milestonesWithDeletedAutomation}
            onUpdateAutomation={async () => {}}
            onDeleteAutomation={() => {}}
        />
    );
};

interface EditableMilestoneListRendererProps {
    plan: IReleasePlan;
    milestonesWithAutomation?: Set<string>;
    milestonesWithDeletedAutomation?: Set<string>;
    onUpdateAutomation: (
        sourceMilestoneId: string,
        payload: ChangeMilestoneProgressionSchema,
    ) => Promise<void>;
    onDeleteAutomation: (sourceMilestoneId: string) => void;
}

export const EditableMilestoneListRenderer = ({
    plan,
    milestonesWithAutomation = new Set(),
    milestonesWithDeletedAutomation = new Set(),
    onUpdateAutomation,
    onDeleteAutomation,
}: EditableMilestoneListRendererProps) => {
    return (
        <MilestoneListRendererCore
            plan={plan}
            readonly={false}
            milestonesWithAutomation={milestonesWithAutomation}
            milestonesWithDeletedAutomation={milestonesWithDeletedAutomation}
            onUpdateAutomation={onUpdateAutomation}
            onDeleteAutomation={onDeleteAutomation}
        />
    );
};
