import type { FC, ReactNode } from 'react';
import { Typography } from '@mui/material';
import type {
    ChangeRequestState,
    IChangeRequestChangeMilestoneProgression,
} from 'component/changeRequest/changeRequest.types';
import type { IReleasePlan } from 'interfaces/releasePlans';
import type { ChangeMilestoneProgressionSchema } from 'openapi';
import { EventDiff } from 'component/events/EventDiff/EventDiff';
import { Tab, TabList, TabPanel, Tabs } from './ChangeTabComponents.tsx';
import { Action, ChangeItemInfo, ChangeItemWrapper } from './Change.styles.tsx';
import { styled } from '@mui/material';
import {
    ReadonlyMilestoneListRenderer,
    EditableMilestoneListRenderer,
} from './MilestoneListRenderer.tsx';
import { applyProgressionChanges } from './applyProgressionChanges.ts';

const StyledTabs = styled(Tabs)(({ theme }) => ({
    display: 'flex',
    flexFlow: 'column',
    gap: theme.spacing(1),
}));

interface ProgressionChangeProps {
    change: IChangeRequestChangeMilestoneProgression;
    currentReleasePlan?: IReleasePlan;
    actions?: ReactNode;
    changeRequestState: ChangeRequestState;
    onUpdateChangeRequestSubmit: (
        sourceMilestoneId: string,
        payload: ChangeMilestoneProgressionSchema,
    ) => Promise<void>;
    onDeleteChangeRequestSubmit: (sourceMilestoneId: string) => void;
}

export const ProgressionChange: FC<ProgressionChangeProps> = ({
    change,
    currentReleasePlan,
    actions,
    changeRequestState,
    onUpdateChangeRequestSubmit,
    onDeleteChangeRequestSubmit,
}) => {
    const basePlan = currentReleasePlan;
    if (!basePlan) return null;

    const sourceId = change.payload.sourceMilestone;
    if (!sourceId) return null;

    const sourceMilestone = basePlan.milestones.find(
        (milestone) => milestone.id === sourceId,
    );
    const sourceMilestoneName = sourceMilestone?.name || sourceId;

    const targetMilestoneName =
        basePlan.milestones.find(
            (milestone) => milestone.id === change.payload.targetMilestone,
        )?.name || change.payload.targetMilestone;

    const modifiedPlan = applyProgressionChanges(basePlan, [change]);

    const previousMilestone = sourceMilestone;
    const newMilestone = modifiedPlan.milestones.find(
        (milestone) => milestone.id === sourceId,
    );

    const readonly =
        changeRequestState === 'Applied' || changeRequestState === 'Cancelled';

    return (
        <StyledTabs>
            <ChangeItemWrapper>
                <ChangeItemInfo>
                    <Action>Changing automation in release plan</Action>
                    <Typography component='span'>
                        {sourceMilestoneName} → {targetMilestoneName}
                    </Typography>
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
                {readonly ? (
                    <ReadonlyMilestoneListRenderer plan={modifiedPlan} />
                ) : (
                    <EditableMilestoneListRenderer
                        plan={modifiedPlan}
                        milestonesWithAutomation={
                            new Set([sourceId].filter(Boolean))
                        }
                        onUpdateAutomation={onUpdateChangeRequestSubmit}
                        onDeleteAutomation={onDeleteChangeRequestSubmit}
                    />
                )}
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
