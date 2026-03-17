import type { FC } from 'react';
import { styled } from '@mui/material';
import type {
    ChangeRequestType,
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
    type ReleasePlanChange,
} from './MilestoneListRenderer.tsx';
import { applyReleasePlanChanges } from './applyReleasePlanChanges.js';
import { EventDiff } from 'component/events/EventDiff/EventDiff';

const StyledTabs = styled(Tabs)(({ theme }) => ({
    display: 'flex',
    flexFlow: 'column',
    gap: theme.spacing(1),
}));

type ChangeDescription = {
    text: string;
    action: ReleasePlanChange['action'];
};

type MilestoneChanges = {
    [milestoneId: string]: Array<{
        description: ChangeDescription;
        change: ReleasePlanChange;
    }>;
};

const processReleasePlanChanges = (
    changes: ReleasePlanChange[],
    basePlan: IReleasePlan,
): MilestoneChanges => {
    const changesByMilestone: MilestoneChanges = {};

    const releasePlanStrategies = new Map(
        basePlan.milestones.flatMap((milestone) =>
            milestone.strategies.map((strategy) => [
                strategy.id,
                { milestone, strategy },
            ]),
        ),
    );

    const milestoneName = (id: string) =>
        basePlan.milestones.find((milestone) => milestone.id === id)?.name ||
        id;

    const addToMilestone = (
        milestoneId: string,
        change: ReleasePlanChange,
        description: ChangeDescription,
    ) => {
        const existing = changesByMilestone[milestoneId] ?? [];
        existing.push({ change, description });
        changesByMilestone[milestoneId] = existing;
    };

    for (const change of changes) {
        switch (change.action) {
            case 'changeMilestoneProgression':
            case 'deleteMilestoneProgression': {
                const milestoneId = change.payload.sourceMilestone;
                const label =
                    change.action === 'changeMilestoneProgression'
                        ? 'Editing'
                        : 'Deleting';
                addToMilestone(milestoneId, change, {
                    text: `${label} automation for ${milestoneName(milestoneId)}`,
                    action: change.action,
                });
                break;
            }
            case 'updateMilestoneStrategy': {
                const strategyInfo = releasePlanStrategies.get(
                    change.payload.id,
                );
                if (strategyInfo) {
                    const strategyLabel =
                        change.payload.title ||
                        strategyInfo.strategy.name ||
                        'strategy';
                    addToMilestone(strategyInfo.milestone.id, change, {
                        text: `Editing ${strategyLabel} in ${strategyInfo.milestone.name || strategyInfo.milestone.id}`,
                        action: change.action,
                    });
                }
                break;
            }
        }
    }

    return changesByMilestone;
};

export const ConsolidatedReleasePlanChanges: FC<{
    feature: IChangeRequestFeature;
    currentReleasePlan?: IReleasePlan;
    changeRequest: ChangeRequestType;
    onUpdateChangeRequestSubmit: (
        sourceMilestoneId: string,
        payload: ChangeMilestoneProgressionSchema,
    ) => Promise<void>;
    onDeleteChangeRequestSubmit: (sourceMilestoneId: string) => Promise<void>;
    onRefetch?: () => void;
}> = ({
    feature,
    currentReleasePlan,
    changeRequest,
    onUpdateChangeRequestSubmit,
    onDeleteChangeRequestSubmit,
    onRefetch,
}) => {
    const changeRequestState = changeRequest.state;

    const releasePlanChanges = feature.changes.filter(
        (
            change,
        ): change is
            | IChangeRequestChangeMilestoneProgression
            | IChangeRequestDeleteMilestoneProgression
            | IChangeRequestUpdateMilestoneStrategy =>
            change.action === 'changeMilestoneProgression' ||
            change.action === 'deleteMilestoneProgression' ||
            change.action === 'updateMilestoneStrategy',
    );

    // Only progression changes carry a release plan snapshot;
    // updateMilestoneStrategy snapshots are strategy objects, not plans.
    const firstProgressionChange = releasePlanChanges.find(
        (change): change is IChangeRequestChangeMilestoneProgression =>
            change.action === 'changeMilestoneProgression',
    );
    const planSnapshot = firstProgressionChange?.payload.snapshot;
    const basePlan =
        (changeRequestState === 'Applied' || !currentReleasePlan) &&
        planSnapshot
            ? planSnapshot
            : currentReleasePlan;

    if (!basePlan) {
        return null;
    }

    const modifiedPlan = applyReleasePlanChanges(basePlan, releasePlanChanges);
    const changesByMilestone = processReleasePlanChanges(
        releasePlanChanges,
        basePlan,
    );

    const readonly =
        changeRequestState === 'Applied' || changeRequestState === 'Cancelled';

    const descriptionWrappers = {
        changeMilestoneProgression: Added,
        deleteMilestoneProgression: Deleted,
        updateMilestoneStrategy: Action,
    };

    return (
        <StyledTabs>
            <ChangeItemWrapper>
                <ChangeItemInfo>
                    {basePlan.milestones.flatMap(({ id }, index) => {
                        const changes = changesByMilestone[id];
                        if (!changes) return null;

                        return changes.map(({ description }) => {
                            const Component =
                                descriptionWrappers[description.action];
                            return (
                                <Component key={index}>
                                    {description.text}
                                </Component>
                            );
                        });
                    })}
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
                        changesByMilestone={changesByMilestone}
                    />
                ) : (
                    <EditableMilestoneListRenderer
                        plan={modifiedPlan}
                        changesByMilestone={changesByMilestone}
                        onUpdateAutomation={onUpdateChangeRequestSubmit}
                        onDeleteAutomation={onDeleteChangeRequestSubmit}
                        changeRequest={changeRequest}
                        onRefetch={onRefetch}
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
