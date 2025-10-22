import type { FC, ReactNode } from 'react';
import { Typography } from '@mui/material';
import type {
    ChangeRequestState,
    IChangeRequestCreateMilestoneProgression,
    IChangeRequestUpdateMilestoneProgression,
} from 'component/changeRequest/changeRequest.types';
import type { IReleasePlan } from 'interfaces/releasePlans';
import type { UpdateMilestoneProgressionSchema } from 'openapi';
import { EventDiff } from 'component/events/EventDiff/EventDiff';
import { Tab, TabList, TabPanel, Tabs } from './ChangeTabComponents.tsx';
import {
    Action,
    Added,
    ChangeItemInfo,
    ChangeItemWrapper,
} from './Change.styles.tsx';
import { styled } from '@mui/material';
import { MilestoneListRenderer } from './MilestoneListRenderer.tsx';
import { applyProgressionChanges } from './applyProgressionChanges';

const StyledTabs = styled(Tabs)(({ theme }) => ({
    display: 'flex',
    flexFlow: 'column',
    gap: theme.spacing(1),
}));

interface ProgressionChangeProps {
    change:
        | IChangeRequestCreateMilestoneProgression
        | IChangeRequestUpdateMilestoneProgression;
    currentReleasePlan?: IReleasePlan;
    actions?: ReactNode;
    changeRequestState: ChangeRequestState;
    onUpdateChangeRequestSubmit?: (
        sourceMilestoneId: string,
        payload: UpdateMilestoneProgressionSchema,
    ) => Promise<void>;
    onDeleteChangeRequestSubmit?: (sourceMilestoneId: string) => void;
}

export const ProgressionChange: FC<ProgressionChangeProps> = ({
    change,
    currentReleasePlan,
    actions,
    changeRequestState,
    onUpdateChangeRequestSubmit,
    onDeleteChangeRequestSubmit,
}) => {
    const basePlan = change.payload.snapshot || currentReleasePlan;
    if (!basePlan) return null;

    const isCreate = change.action === 'createMilestoneProgression';
    const sourceId = change.payload.sourceMilestone;

    if (!sourceId) return null;

    const sourceMilestone = basePlan.milestones.find(
        (milestone) => milestone.id === sourceId,
    );
    const sourceMilestoneName = sourceMilestone?.name || sourceId;

    const targetMilestoneName = isCreate
        ? basePlan.milestones.find(
              (milestone) => milestone.id === change.payload.targetMilestone,
          )?.name || change.payload.targetMilestone
        : undefined;

    const modifiedPlan = applyProgressionChanges(basePlan, [change]);

    const previousMilestone = sourceMilestone;
    const newMilestone = modifiedPlan.milestones.find(
        (milestone) => milestone.id === sourceId,
    );

    return (
        <StyledTabs>
            <ChangeItemWrapper>
                <ChangeItemInfo>
                    {isCreate ? (
                        <>
                            <Added>Adding automation to release plan</Added>
                            <Typography component='span'>
                                {sourceMilestoneName} → {targetMilestoneName}
                            </Typography>
                        </>
                    ) : (
                        <>
                            <Action>Updating automation in release plan</Action>
                            <Typography component='span'>
                                {sourceMilestoneName}
                            </Typography>
                        </>
                    )}
                </ChangeItemInfo>
                <div>
                    <TabList>
                        <Tab>View change</Tab>
                        <Tab>View diff</Tab>
                    </TabList>
                    {actions}
                </div>
            </ChangeItemWrapper>
            <TabPanel>
                <MilestoneListRenderer
                    plan={modifiedPlan}
                    changeRequestState={changeRequestState}
                    milestonesWithAutomation={new Set([sourceId])}
                    onUpdateAutomation={onUpdateChangeRequestSubmit}
                    onDeleteAutomation={onDeleteChangeRequestSubmit}
                />
            </TabPanel>
            <TabPanel variant='diff'>
                <EventDiff
                    entry={{
                        preData: previousMilestone,
                        data: newMilestone,
                    }}
                />
            </TabPanel>
        </StyledTabs>
    );
};
