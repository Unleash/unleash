import { useRef, useState, type FC, type ReactNode } from 'react';
import { Box, styled, Typography } from '@mui/material';
import type {
    ChangeRequestState,
    IChangeRequestAddReleasePlan,
    IChangeRequestDeleteReleasePlan,
    IChangeRequestStartMilestone,
} from 'component/changeRequest/changeRequest.types';
import { useReleasePlanPreview } from 'hooks/useReleasePlanPreview';
import { useReleasePlans } from 'hooks/api/getters/useReleasePlans/useReleasePlans';
import { TooltipLink } from 'component/common/TooltipLink/TooltipLink';
import { EventDiff } from 'component/events/EventDiff/EventDiff';
import { ReleasePlan } from 'component/feature/FeatureView/FeatureOverview/ReleasePlan/ReleasePlan';
import { ReleasePlanMilestone } from 'component/feature/FeatureView/FeatureOverview/ReleasePlan/ReleasePlanMilestone/ReleasePlanMilestone';
import type { IReleasePlan } from 'interfaces/releasePlans';
import { Tab, TabList, TabPanel, Tabs } from './ChangeTabComponents.tsx';
import { ChangeItemInfo } from './Change.styles.tsx';

export const ChangeItemWrapper = styled(Box)({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
});

const ChangeItemCreateEditDeleteWrapper = styled(Box)(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: 'auto auto',
    justifyContent: 'space-between',
    gap: theme.spacing(1),
    alignItems: 'center',
    marginBottom: theme.spacing(2),
    width: '100%',
}));

const DeleteReleasePlan: FC<{
    change: IChangeRequestDeleteReleasePlan;
    currentReleasePlan?: IReleasePlan;
    changeRequestState: ChangeRequestState;
    actions?: ReactNode;
}> = ({ change, currentReleasePlan, changeRequestState, actions }) => {
    const releasePlan =
        changeRequestState === 'Applied' && change.payload.snapshot
            ? change.payload.snapshot
            : currentReleasePlan;

    if (!releasePlan) return;

    return (
        <>
            <ChangeItemCreateEditDeleteWrapper>
                <ChangeItemInfo>
                    <Typography
                        sx={(theme) => ({
                            color: theme.palette.error.main,
                        })}
                    >
                        - Deleting release plan
                    </Typography>
                    <Typography>{releasePlan.name}</Typography>
                </ChangeItemInfo>
                <div>{actions}</div>
            </ChangeItemCreateEditDeleteWrapper>
            <ReleasePlan plan={releasePlan} readonly />
        </>
    );
};

const StartMilestone: FC<{
    change: IChangeRequestStartMilestone;
    currentReleasePlan?: IReleasePlan;
    changeRequestState: ChangeRequestState;
    actions?: ReactNode;
}> = ({ change, currentReleasePlan, changeRequestState, actions }) => {
    const releasePlan =
        changeRequestState === 'Applied' && change.payload.snapshot
            ? change.payload.snapshot
            : currentReleasePlan;

    if (!releasePlan) return;

    const previousMilestone = releasePlan.milestones.find(
        (milestone) => milestone.id === releasePlan.activeMilestoneId,
    );

    const newMilestone = releasePlan.milestones.find(
        (milestone) => milestone.id === change.payload.milestoneId,
    );

    if (!newMilestone) return;

    return (
        <Tabs>
            <ChangeItemCreateEditDeleteWrapper>
                <ChangeItemInfo>
                    <Typography color='success.dark'>
                        + Start milestone
                    </Typography>
                    <Typography>{newMilestone.name}</Typography>
                </ChangeItemInfo>
                <div>
                    <TabList>
                        <Tab>Change</Tab>
                        <Tab>View diff</Tab>
                    </TabList>
                    {actions}
                </div>
            </ChangeItemCreateEditDeleteWrapper>
            <TabPanel>
                <ReleasePlanMilestone readonly milestone={newMilestone} />
            </TabPanel>
            <TabPanel variant='diff'>
                <EventDiff
                    entry={{
                        preData: previousMilestone,
                        data: newMilestone,
                    }}
                />
            </TabPanel>
        </Tabs>
    );
};

const AddReleasePlan: FC<{
    change: IChangeRequestAddReleasePlan;
    currentReleasePlan?: IReleasePlan;
    environmentName: string;
    featureName: string;
    actions?: ReactNode;
}> = ({
    change,
    currentReleasePlan,
    environmentName,
    featureName,
    actions,
}) => {
    const [currentTooltipOpen, setCurrentTooltipOpen] = useState(false);
    const currentTooltipCloseTimeoutRef = useRef<NodeJS.Timeout>();
    const openCurrentTooltip = () => {
        if (currentTooltipCloseTimeoutRef.current) {
            clearTimeout(currentTooltipCloseTimeoutRef.current);
        }
        setCurrentTooltipOpen(true);
    };
    const closeCurrentTooltip = () => {
        currentTooltipCloseTimeoutRef.current = setTimeout(() => {
            setCurrentTooltipOpen(false);
        }, 100);
    };

    const planPreview = useReleasePlanPreview(
        change.payload.templateId,
        featureName,
        environmentName,
    );

    const planPreviewDiff = {
        ...planPreview,
        discriminator: 'plan',
        releasePlanTemplateId: change.payload.templateId,
    };

    if (!currentReleasePlan) {
        return (
            <>
                <ChangeItemCreateEditDeleteWrapper>
                    <ChangeItemInfo>
                        <Typography color='success.dark'>
                            + Adding release plan
                        </Typography>
                        <Typography>{planPreview.name}</Typography>
                    </ChangeItemInfo>
                    <div>{actions}</div>
                </ChangeItemCreateEditDeleteWrapper>
                <ReleasePlan plan={planPreview} readonly />
            </>
        );
    }

    return (
        <Tabs>
            <ChangeItemCreateEditDeleteWrapper>
                <ChangeItemInfo>
                    <Typography>
                        Replacing{' '}
                        <TooltipLink
                            tooltip={
                                <div
                                    onMouseEnter={() => openCurrentTooltip()}
                                    onMouseLeave={() => closeCurrentTooltip()}
                                >
                                    <ReleasePlan
                                        plan={currentReleasePlan}
                                        readonly
                                    />
                                </div>
                            }
                            tooltipProps={{
                                open: currentTooltipOpen,
                                maxWidth: 500,
                                maxHeight: 600,
                            }}
                        >
                            <span
                                onMouseEnter={() => openCurrentTooltip()}
                                onMouseLeave={() => closeCurrentTooltip()}
                            >
                                current
                            </span>
                        </TooltipLink>{' '}
                        release plan with
                    </Typography>
                    <Typography>{planPreview.name}</Typography>
                </ChangeItemInfo>
                <div>
                    <TabList>
                        <Tab>Changes</Tab>
                        <Tab>View diff</Tab>
                    </TabList>
                    {actions}
                </div>
            </ChangeItemCreateEditDeleteWrapper>
            <TabPanel>
                <ReleasePlan plan={planPreview} readonly />
            </TabPanel>
            <TabPanel variant='diff'>
                <EventDiff
                    entry={{
                        preData: currentReleasePlan,
                        data: planPreviewDiff,
                    }}
                />
            </TabPanel>
        </Tabs>
    );
};

export const ReleasePlanChange: FC<{
    actions?: ReactNode;
    change:
        | IChangeRequestAddReleasePlan
        | IChangeRequestDeleteReleasePlan
        | IChangeRequestStartMilestone;
    environmentName: string;
    featureName: string;
    projectId: string;
    changeRequestState: ChangeRequestState;
}> = ({
    actions,
    change,
    featureName,
    environmentName,
    projectId,
    changeRequestState,
}) => {
    const { releasePlans } = useReleasePlans(
        projectId,
        featureName,
        environmentName,
    );
    const currentReleasePlan = releasePlans[0];

    return (
        <>
            {change.action === 'addReleasePlan' && (
                <AddReleasePlan
                    change={change}
                    currentReleasePlan={currentReleasePlan}
                    environmentName={environmentName}
                    featureName={featureName}
                    actions={actions}
                />
            )}
            {change.action === 'deleteReleasePlan' && (
                <DeleteReleasePlan
                    change={change}
                    currentReleasePlan={currentReleasePlan}
                    changeRequestState={changeRequestState}
                    actions={actions}
                />
            )}
            {change.action === 'startMilestone' && (
                <StartMilestone
                    change={change}
                    currentReleasePlan={currentReleasePlan}
                    changeRequestState={changeRequestState}
                    actions={actions}
                />
            )}
        </>
    );
};
