import type { FC } from 'react';
import { styled } from '@mui/material';
import type {
    ChangeRequestState,
    IChangeRequestChangeMilestoneProgression,
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
import type { ChangeMilestoneProgressionSchema } from 'openapi';
import {
    ReadonlyMilestoneListRenderer,
    EditableMilestoneListRenderer,
} from './MilestoneListRenderer.tsx';
import { applyProgressionChanges } from './applyProgressionChanges.js';
import { EventDiff } from 'component/events/EventDiff/EventDiff';

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

const getChangeDescriptions = (
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

export const ConsolidatedProgressionChanges: FC<{
    feature: IChangeRequestFeature;
    currentReleasePlan?: IReleasePlan;
    changeRequestState: ChangeRequestState;
    onUpdateChangeRequestSubmit: (
        sourceMilestoneId: string,
        payload: ChangeMilestoneProgressionSchema,
    ) => Promise<void>;
    onDeleteChangeRequestSubmit: (sourceMilestoneId: string) => Promise<void>;
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
            | IChangeRequestChangeMilestoneProgression
            | IChangeRequestDeleteMilestoneProgression =>
            change.action === 'changeMilestoneProgression' ||
            change.action === 'deleteMilestoneProgression',
    );

    if (progressionChanges.length === 0) return null;

    const basePlan = currentReleasePlan;

    if (!basePlan) {
        return null;
    }

    const modifiedPlan = applyProgressionChanges(basePlan, progressionChanges);
    const milestonesWithAutomation =
        getMilestonesWithAutomation(progressionChanges);
    const milestonesWithDeletedAutomation =
        getMilestonesWithDeletedAutomation(progressionChanges);
    const changeDescriptions = getChangeDescriptions(
        progressionChanges,
        basePlan,
    );

    const readonly =
        changeRequestState === 'Applied' || changeRequestState === 'Cancelled';

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
                {readonly ? (
                    <ReadonlyMilestoneListRenderer plan={modifiedPlan} />
                ) : (
                    <EditableMilestoneListRenderer
                        plan={modifiedPlan}
                        milestonesWithAutomation={milestonesWithAutomation}
                        milestonesWithDeletedAutomation={
                            milestonesWithDeletedAutomation
                        }
                        onUpdateAutomation={onUpdateChangeRequestSubmit}
                        onDeleteAutomation={onDeleteChangeRequestSubmit}
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
