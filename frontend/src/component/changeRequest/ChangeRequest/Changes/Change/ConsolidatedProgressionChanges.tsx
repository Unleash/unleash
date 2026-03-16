import { type FC, useCallback, useState } from 'react';
import { styled } from '@mui/material';
import type {
    ChangeRequestState,
    IChangeRequestChangeMilestoneProgression,
    IChangeRequestDeleteMilestoneProgression,
    IChangeRequestUpdateMilestoneStrategy,
    IChangeRequestFeature,
} from 'component/changeRequest/changeRequest.types';
import type { IReleasePlan } from 'interfaces/releasePlans';
import { Tab, TabList, TabPanel, Tabs } from './ChangeTabComponents.tsx';
import {
    Action,
    Added,
    ChangeItemInfo,
    ChangeItemWrapper,
    Deleted,
} from './Change.styles.tsx';
import type { ChangeMilestoneProgressionSchema } from 'openapi';
import {
    ReadonlyMilestoneListRenderer,
    EditableMilestoneListRenderer,
} from './MilestoneListRenderer.tsx';
import { applyProgressionChanges } from './applyProgressionChanges.js';
import { applyStrategyChanges } from './applyStrategyChanges.ts';
import { EventDiff } from 'component/events/EventDiff/EventDiff';
import { EditChange } from './EditChange.tsx';

const StyledTabs = styled(Tabs)(({ theme }) => ({
    display: 'flex',
    flexFlow: 'column',
    gap: theme.spacing(1),
}));

type ProgressionChange =
    | IChangeRequestChangeMilestoneProgression
    | IChangeRequestDeleteMilestoneProgression;

const getMilestonesWithAutomation = (
    progressionChanges: ProgressionChange[],
): Set<string> => {
    return new Set(
        progressionChanges
            .filter((change) => change.action === 'changeMilestoneProgression')
            .map((change) => change.payload.sourceMilestone)
            .filter((id): id is string => Boolean(id)),
    );
};

const getMilestonesWithDeletedAutomation = (
    progressionChanges: ProgressionChange[],
): Set<string> => {
    return new Set(
        progressionChanges
            .filter((change) => change.action === 'deleteMilestoneProgression')
            .map((change) => change.payload.sourceMilestone)
            .filter((id): id is string => Boolean(id)),
    );
};

const getProgressionChangeDescriptions = (
    progressionChanges: ProgressionChange[],
    basePlan: IReleasePlan,
): string[] => {
    return progressionChanges.map((change) => {
        const sourceId = change.payload.sourceMilestone;
        const sourceName =
            basePlan.milestones.find((milestone) => milestone.id === sourceId)
                ?.name || sourceId;
        const action =
            change.action === 'changeMilestoneProgression'
                ? 'Changing'
                : 'Deleting';
        return `${action} automation for ${sourceName}`;
    });
};

const getMilestonesWithStrategyChanges = (
    strategyChanges: IChangeRequestUpdateMilestoneStrategy[],
    basePlan: IReleasePlan,
): Set<string> => {
    const milestoneIds = new Set<string>();
    for (const change of strategyChanges) {
        for (const milestone of basePlan.milestones) {
            if (milestone.strategies.some((s) => s.id === change.payload.id)) {
                milestoneIds.add(milestone.id);
                break;
            }
        }
    }
    return milestoneIds;
};

const getStrategyChangeDescriptions = (
    strategyChanges: IChangeRequestUpdateMilestoneStrategy[],
    basePlan: IReleasePlan,
): string[] => {
    return strategyChanges.map((change) => {
        for (const milestone of basePlan.milestones) {
            const strategy = milestone.strategies.find(
                (s) => s.id === change.payload.id,
            );
            if (strategy) {
                const strategyLabel =
                    change.payload.title ||
                    strategy.title ||
                    strategy.strategyName ||
                    'strategy';
                return `Editing ${strategyLabel} in ${milestone.name}`;
            }
        }
        return 'Editing strategy';
    });
};

export const ConsolidatedProgressionChanges: FC<{
    feature: IChangeRequestFeature;
    currentReleasePlan?: IReleasePlan;
    changeRequestState: ChangeRequestState;
    changeRequestId: number;
    environmentName: string;
    onUpdateChangeRequestSubmit: (
        sourceMilestoneId: string,
        payload: ChangeMilestoneProgressionSchema,
    ) => Promise<void>;
    onDeleteChangeRequestSubmit: (sourceMilestoneId: string) => Promise<void>;
    onRefetch?: () => void;
}> = ({
    feature,
    currentReleasePlan,
    changeRequestState,
    changeRequestId,
    environmentName,
    onUpdateChangeRequestSubmit,
    onDeleteChangeRequestSubmit,
    onRefetch,
}) => {
    // Get all progression changes for this feature
    const progressionChanges = feature.changes.filter(
        (
            change,
        ): change is
            | IChangeRequestChangeMilestoneProgression
            | IChangeRequestDeleteMilestoneProgression =>
            change.action === 'changeMilestoneProgression' ||
            change.action === 'deleteMilestoneProgression',
    );

    // Get all milestone strategy changes for this feature
    const strategyChanges = feature.changes.filter(
        (change): change is IChangeRequestUpdateMilestoneStrategy =>
            change.action === 'updateMilestoneStrategy',
    );

    if (progressionChanges.length === 0 && strategyChanges.length === 0)
        return null;

    // Only progression changes carry a release plan snapshot;
    // updateMilestoneStrategy snapshots are strategy objects, not plans.
    const firstProgressionChange = progressionChanges[0];
    const planSnapshot = firstProgressionChange?.payload.snapshot;
    const releasePlan =
        (changeRequestState === 'Applied' || !currentReleasePlan) &&
        planSnapshot
            ? planSnapshot
            : currentReleasePlan;

    const basePlan = releasePlan;

    if (!basePlan) {
        return null;
    }

    const withProgressionChanges = applyProgressionChanges(
        basePlan,
        progressionChanges,
    );
    const modifiedPlan = applyStrategyChanges(
        withProgressionChanges,
        strategyChanges,
    );
    const milestonesWithAutomation =
        getMilestonesWithAutomation(progressionChanges);
    const milestonesWithDeletedAutomation =
        getMilestonesWithDeletedAutomation(progressionChanges);
    const milestonesWithStrategyEdits = getMilestonesWithStrategyChanges(
        strategyChanges,
        basePlan,
    );
    const progressionDescriptions = getProgressionChangeDescriptions(
        progressionChanges,
        basePlan,
    );
    const strategyDescriptions = getStrategyChangeDescriptions(
        strategyChanges,
        basePlan,
    );

    const readonly =
        changeRequestState === 'Applied' || changeRequestState === 'Cancelled';

    const strategyChangeMap = new Map(
        strategyChanges.map((c) => [c.payload.id, c]),
    );
    const [editingChange, setEditingChange] =
        useState<IChangeRequestUpdateMilestoneStrategy | null>(null);
    const [editOpen, setEditOpen] = useState(false);

    const onEditStrategy = useCallback(
        (strategyId: string) => {
            const change = strategyChangeMap.get(strategyId);
            if (change) {
                setEditingChange(change);
                setEditOpen(true);
            }
        },
        [strategyChangeMap],
    );

    return (
        <StyledTabs>
            <ChangeItemWrapper>
                <ChangeItemInfo>
                    {progressionChanges.map((change, index) => {
                        const Component =
                            change.action === 'deleteMilestoneProgression'
                                ? Deleted
                                : Added;
                        return (
                            <Component key={`progression-${index}`}>
                                {progressionDescriptions[index]}
                            </Component>
                        );
                    })}
                    {strategyChanges.map((_, index) => (
                        <Action key={`strategy-${index}`}>
                            {strategyDescriptions[index]}
                        </Action>
                    ))}
                </ChangeItemInfo>
                <div>
                    <TabList>
                        <Tab>View change</Tab>
                        <Tab>View diff</Tab>
                    </TabList>
                </div>
            </ChangeItemWrapper>
            <TabPanel>
                {readonly ? (
                    <ReadonlyMilestoneListRenderer
                        plan={modifiedPlan}
                        milestonesWithStrategyChanges={
                            milestonesWithStrategyEdits
                        }
                    />
                ) : (
                    <EditableMilestoneListRenderer
                        plan={modifiedPlan}
                        milestonesWithAutomation={milestonesWithAutomation}
                        milestonesWithDeletedAutomation={
                            milestonesWithDeletedAutomation
                        }
                        milestonesWithStrategyChanges={
                            milestonesWithStrategyEdits
                        }
                        onUpdateAutomation={onUpdateChangeRequestSubmit}
                        onDeleteAutomation={onDeleteChangeRequestSubmit}
                        onEditStrategy={onEditStrategy}
                    />
                )}
                {editingChange && (
                    <EditChange
                        changeRequestId={changeRequestId}
                        featureId={feature.name}
                        change={editingChange}
                        environment={environmentName}
                        open={editOpen}
                        onSubmit={() => {
                            setEditOpen(false);
                            setEditingChange(null);
                            onRefetch?.();
                        }}
                        onClose={() => {
                            setEditOpen(false);
                            setEditingChange(null);
                        }}
                    />
                )}
            </TabPanel>
            <TabPanel variant='diff'>
                <EventDiff
                    entry={{
                        preData: basePlan,
                        data: modifiedPlan,
                    }}
                />
            </TabPanel>
        </StyledTabs>
    );
};
