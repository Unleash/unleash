import type { FC } from 'react';
import { Alert, styled } from '@mui/material';
import type {
    ChangeRequestState,
    IChangeRequestCreateMilestoneProgression,
    IChangeRequestUpdateMilestoneProgression,
    IChangeRequestDeleteMilestoneProgression,
    IChangeRequestFeature,
} from 'component/changeRequest/changeRequest.types';
import type { IReleasePlan } from 'interfaces/releasePlans';
import { Tab, TabList, TabPanel, Tabs } from './ChangeTabComponents.tsx';
import {
    Added,
    ChangeItemInfo,
    ChangeItemWrapper,
    Deleted,
} from './Change.styles.tsx';
import type { UpdateMilestoneProgressionSchema } from 'openapi';
import { MilestoneListRenderer } from './MilestoneListRenderer.tsx';
import { applyProgressionChanges } from './applyProgressionChanges';
import { EventDiff } from 'component/events/EventDiff/EventDiff';

const StyledTabs = styled(Tabs)(({ theme }) => ({
    display: 'flex',
    flexFlow: 'column',
    gap: theme.spacing(1),
}));

export const ConsolidatedProgressionChanges: FC<{
    feature: IChangeRequestFeature;
    currentReleasePlan?: IReleasePlan;
    changeRequestState: ChangeRequestState;
    onUpdateChangeRequestSubmit?: (
        sourceMilestoneId: string,
        payload: UpdateMilestoneProgressionSchema,
    ) => Promise<void>;
    onDeleteChangeRequestSubmit?: (sourceMilestoneId: string) => Promise<void>;
}> = ({
    feature,
    currentReleasePlan,
    changeRequestState,
    onUpdateChangeRequestSubmit,
    onDeleteChangeRequestSubmit,
}) => {
    // Get all progression changes for this feature
    const progressionChanges = feature.changes.filter(
        (
            change,
        ): change is
            | IChangeRequestCreateMilestoneProgression
            | IChangeRequestUpdateMilestoneProgression
            | IChangeRequestDeleteMilestoneProgression =>
            change.action === 'createMilestoneProgression' ||
            change.action === 'updateMilestoneProgression' ||
            change.action === 'deleteMilestoneProgression',
    );

    if (progressionChanges.length === 0) return null;

    // Use snapshot from first change if available, otherwise use current release plan
    const firstChangeWithSnapshot =
        progressionChanges.find(
            (change) =>
                change.payload?.snapshot &&
                (change.action === 'createMilestoneProgression' ||
                    change.action === 'updateMilestoneProgression'),
        ) || progressionChanges.find((change) => change.payload?.snapshot);
    const basePlan =
        firstChangeWithSnapshot?.payload?.snapshot || currentReleasePlan;

    if (!basePlan) {
        return (
            <Alert severity='error'>
                Unable to load release plan data. Please refresh the page.
            </Alert>
        );
    }

    // Apply all progression changes
    const modifiedPlan = applyProgressionChanges(basePlan, progressionChanges);

    // Collect milestone IDs with automation (modified or original)
    const milestonesWithAutomation = new Set(
        progressionChanges
            .filter(
                (change) =>
                    change.action === 'createMilestoneProgression' ||
                    change.action === 'updateMilestoneProgression',
            )
            .map((change) =>
                change.action === 'createMilestoneProgression'
                    ? change.payload.sourceMilestone
                    : change.payload.sourceMilestoneId ||
                      change.payload.sourceMilestone,
            )
            .filter((id): id is string => Boolean(id)),
    );

    const milestonesWithDeletedAutomation = new Set(
        progressionChanges
            .filter((change) => change.action === 'deleteMilestoneProgression')
            .map(
                (change) =>
                    change.payload.sourceMilestoneId ||
                    change.payload.sourceMilestone,
            )
            .filter((id): id is string => Boolean(id)),
    );

    const changeDescriptions = progressionChanges.map((change) => {
        const sourceId =
            change.action === 'createMilestoneProgression'
                ? change.payload.sourceMilestone
                : change.payload.sourceMilestoneId ||
                  change.payload.sourceMilestone;
        const sourceName =
            basePlan.milestones.find((milestone) => milestone.id === sourceId)
                ?.name || sourceId;
        const action =
            change.action === 'createMilestoneProgression'
                ? 'Adding'
                : change.action === 'deleteMilestoneProgression'
                  ? 'Deleting'
                  : 'Updating';
        return `${action} automation for ${sourceName}`;
    });

    // For diff view, we need to use basePlan with deleted automations shown
    const basePlanWithDeletedAutomations: IReleasePlan = {
        ...basePlan,
        milestones: basePlan.milestones.map((milestone) => {
            // If this milestone is being deleted, ensure it has its transition condition
            if (milestonesWithDeletedAutomation.has(milestone.id)) {
                return milestone;
            }
            return milestone;
        }),
    };

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
                            <Component key={index}>
                                {changeDescriptions[index]}
                            </Component>
                        );
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
                <MilestoneListRenderer
                    plan={
                        milestonesWithDeletedAutomation.size > 0
                            ? basePlanWithDeletedAutomations
                            : modifiedPlan
                    }
                    changeRequestState={changeRequestState}
                    milestonesWithAutomation={milestonesWithAutomation}
                    milestonesWithDeletedAutomation={
                        milestonesWithDeletedAutomation
                    }
                    onUpdateAutomation={onUpdateChangeRequestSubmit}
                    onDeleteAutomation={onDeleteChangeRequestSubmit}
                />
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
