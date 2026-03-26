import type { FC } from 'react';
import { styled } from '@mui/material';
import {
    type ChangeRequestType,
    type IChangeRequestChangeMilestoneProgression,
    type IChangeRequestDeleteMilestoneProgression,
    type IChangeRequestUpdateMilestoneStrategy,
    type IChangeRequestFeature,
    isClosed,
} from 'component/changeRequest/changeRequest.types';
import type { IReleasePlan } from 'interfaces/releasePlans';
import { Tab, TabList, TabPanel, Tabs } from './ChangeTabComponents.tsx';
import { ChangeItemInfo, ChangeItemWrapper, colors } from './Change.styles.tsx';
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

const ChangeList = styled('ul')(({ theme }) => ({
    padding: theme.spacing(1.5),
    alignItems: 'flex-start',
    'li[data-action="deleteMilestoneProgression"]': {
        color: colors(theme).deleted,
        '::marker': { content: '"- "' },
    },
}));

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

    const isReleasePlan = (snapshot: unknown): snapshot is IReleasePlan =>
        snapshot instanceof Object && 'milestones' in snapshot;
    const planSnapshot = releasePlanChanges.find((change) =>
        isReleasePlan(change.payload.snapshot),
    )?.payload.snapshot;

    const basePlan =
        (isClosed(changeRequestState) || !currentReleasePlan) && planSnapshot
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

    const readonly = isClosed(changeRequestState);

    return (
        <StyledTabs>
            <ChangeItemWrapper>
                <ChangeItemInfo component={'div'}>
                    <ChangeList>
                        {basePlan.milestones.flatMap(({ id }) => {
                            const changes = changesByMilestone[id];
                            if (!changes) return null;

                            return changes.map(({ description }) => {
                                return (
                                    <li data-action={description.action}>
                                        {description.text}
                                    </li>
                                );
                            });
                        })}
                    </ChangeList>
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
