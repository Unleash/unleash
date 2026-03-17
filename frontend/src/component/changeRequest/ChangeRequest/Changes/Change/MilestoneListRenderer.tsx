import type React from 'react';
import { styled } from '@mui/material';
import type {
    IReleasePlan,
    IReleasePlanMilestoneStrategy,
} from 'interfaces/releasePlans';
import type { ChangeMilestoneProgressionSchema } from 'openapi';
import { ReleasePlanMilestone } from 'component/feature/FeatureView/FeatureOverview/ReleasePlan/ReleasePlanMilestone/ReleasePlanMilestone';
import { MilestoneAutomationSection } from 'component/feature/FeatureView/FeatureOverview/ReleasePlan/ReleasePlanMilestone/MilestoneAutomationSection.tsx';
import {
    MilestoneTransitionDisplay,
    ReadonlyMilestoneTransitionDisplay,
} from 'component/feature/FeatureView/FeatureOverview/ReleasePlan/ReleasePlanMilestone/MilestoneTransitionDisplay.tsx';
import type { MilestoneStatus } from 'component/feature/FeatureView/FeatureOverview/ReleasePlan/ReleasePlanMilestone/ReleasePlanMilestoneStatus.tsx';
import { Badge } from 'component/common/Badge/Badge';
import type {
    ChangeRequestType,
    IChangeRequestChangeMilestoneProgression,
    IChangeRequestDeleteMilestoneProgression,
    IChangeRequestUpdateMilestoneStrategy,
} from 'component/changeRequest/changeRequest.types';
import { StrategyChange } from './StrategyChange.tsx';
import { ChangeActions } from './ChangeActions.tsx';
import { StrategyItem } from 'component/feature/FeatureView/FeatureOverview/FeatureOverviewEnvironments/FeatureOverviewEnvironment/EnvironmentAccordionBody/StrategyDraggableItem/StrategyItem/StrategyItem.tsx';

const StyledConnection = styled('div')(({ theme }) => ({
    width: 2,
    height: theme.spacing(2),
    backgroundColor: theme.palette.divider,
    marginLeft: theme.spacing(3.5),
}));

export type ReleasePlanChange =
    | IChangeRequestChangeMilestoneProgression
    | IChangeRequestDeleteMilestoneProgression
    | IChangeRequestUpdateMilestoneStrategy;

export type MilestoneChangeEntry = {
    change: ReleasePlanChange;
    [key: string]: unknown;
};

export type MilestoneChanges = {
    [milestoneId: string]: MilestoneChangeEntry[];
};

interface MilestoneListRendererCoreProps {
    plan: IReleasePlan;
    readonly: boolean;
    changesByMilestone: MilestoneChanges;
    onUpdateAutomation: (
        sourceMilestoneId: string,
        payload: ChangeMilestoneProgressionSchema,
    ) => Promise<void>;
    onDeleteAutomation: (sourceMilestoneId: string) => void;
    renderStrategy?: (
        strategy: IReleasePlanMilestoneStrategy,
        index: number,
    ) => React.ReactNode;
}

const MilestoneListRendererCore = ({
    plan,
    readonly,
    changesByMilestone,
    onUpdateAutomation,
    onDeleteAutomation,
    renderStrategy,
}: MilestoneListRendererCoreProps) => {
    const status: MilestoneStatus = {
        type: 'not-started',
        progression: 'active',
    };

    return (
        <>
            {plan.milestones.map((milestone, index) => {
                const milestoneChanges = changesByMilestone[milestone.id] ?? [];
                const hasAutomationChange = milestoneChanges.some(
                    (entry) =>
                        entry.change.action === 'changeMilestoneProgression',
                );
                const hasDeletedAutomation = milestoneChanges.some(
                    (entry) =>
                        entry.change.action === 'deleteMilestoneProgression',
                );
                const hasStrategyChanges = milestoneChanges.some(
                    (entry) =>
                        entry.change.action === 'updateMilestoneStrategy',
                );

                const isNotLastMilestone = index < plan.milestones.length - 1;
                const nextMilestoneId = plan.milestones[index + 1]?.id || '';
                const shouldShowAutomation = readonly
                    ? milestone.transitionCondition !== undefined
                    : hasAutomationChange || hasDeletedAutomation;

                const showAutomation =
                    isNotLastMilestone && shouldShowAutomation;

                const badge = hasDeletedAutomation ? (
                    <Badge color='error'>Deleted in draft</Badge>
                ) : hasAutomationChange ? (
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
                                    environment={plan.environment}
                                />
                            )}
                        </MilestoneAutomationSection>
                    ) : undefined;

                return (
                    <div key={milestone.id}>
                        <ReleasePlanMilestone
                            featureId={plan.featureName}
                            readonly={readonly}
                            milestone={milestone}
                            environmentId={plan.environment}
                            automationSection={automationSection}
                            defaultExpanded={hasStrategyChanges}
                            renderStrategy={renderStrategy}
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
    changesByMilestone?: MilestoneChanges;
}

export const ReadonlyMilestoneListRenderer = ({
    plan,
    changesByMilestone = {},
}: ReadonlyMilestoneListRendererProps) => {
    return (
        <MilestoneListRendererCore
            plan={plan}
            readonly={true}
            changesByMilestone={changesByMilestone}
            onUpdateAutomation={async () => {}}
            onDeleteAutomation={() => {}}
            renderStrategy={(strategy) => <StrategyItem strategy={strategy} />}
        />
    );
};

interface EditableMilestoneListRendererProps {
    plan: IReleasePlan;
    changesByMilestone?: MilestoneChanges;
    onUpdateAutomation: (
        sourceMilestoneId: string,
        payload: ChangeMilestoneProgressionSchema,
    ) => Promise<void>;
    onDeleteAutomation: (sourceMilestoneId: string) => void;
    changeRequest: ChangeRequestType;
    onRefetch?: () => void;
}

const StyledStrategyChange = styled(StrategyChange)(({ theme }) => ({
    paddingInline: theme.spacing(3),
    paddingBlockStart: theme.spacing(0.5),
    paddingBlockEnd: theme.spacing(3),
}));

export const EditableMilestoneListRenderer = ({
    plan,
    changesByMilestone = {},
    onUpdateAutomation,
    onDeleteAutomation,
    changeRequest,
    onRefetch,
}: EditableMilestoneListRendererProps) => {
    const strategyChanges = new Map(
        Object.values(changesByMilestone)
            .flat()
            .map(({ change }) => change)
            .filter(
                (change): change is IChangeRequestUpdateMilestoneStrategy =>
                    change.action === 'updateMilestoneStrategy',
            )
            .map((change) => [change.payload.id, change] as const),
    );

    const renderStrategy = (strategy: IReleasePlanMilestoneStrategy) => {
        const change = strategyChanges.get(strategy.id);
        if (change) {
            return (
                <StyledStrategyChange
                    change={change}
                    featureName={plan.featureName}
                    environmentName={plan.environment}
                    projectId={changeRequest.project}
                    changeRequestState={changeRequest.state}
                    actions={
                        <ChangeActions
                            changeRequest={changeRequest}
                            feature={plan.featureName}
                            change={change}
                            onRefetch={onRefetch}
                        />
                    }
                />
            );
        }
        return <StrategyItem strategy={strategy} />;
    };

    return (
        <MilestoneListRendererCore
            plan={plan}
            readonly={false}
            changesByMilestone={changesByMilestone}
            onUpdateAutomation={onUpdateAutomation}
            onDeleteAutomation={onDeleteAutomation}
            renderStrategy={renderStrategy}
        />
    );
};
