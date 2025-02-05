import type React from 'react';
import type { FC, ReactNode } from 'react';
import { Box, styled, Typography } from '@mui/material';
import type {
    ChangeRequestState,
    IChangeRequestAddReleasePlan,
    IChangeRequestDeleteReleasePlan,
    IChangeRequestStartMilestone,
} from 'component/changeRequest/changeRequest.types';
import { useReleasePlanTemplate } from 'hooks/api/getters/useReleasePlanTemplates/useReleasePlanTemplate';
import { useReleasePlans } from 'hooks/api/getters/useReleasePlans/useReleasePlans';
import { TooltipLink } from 'component/common/TooltipLink/TooltipLink';
import EventDiff from 'component/events/EventDiff/EventDiff';
import { ReleasePlan } from 'component/feature/FeatureView/FeatureOverview/ReleasePlan/ReleasePlan';
import { ReleasePlanMilestone } from 'component/feature/FeatureView/FeatureOverview/ReleasePlan/ReleasePlanMilestone/ReleasePlanMilestone';

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

const ChangeItemInfo: FC<{ children?: React.ReactNode }> = styled(Box)(
    ({ theme }) => ({
        display: 'flex',
        gap: theme.spacing(1),
    }),
);

const ViewDiff = styled('span')(({ theme }) => ({
    color: theme.palette.primary.main,
    marginLeft: theme.spacing(1),
}));

const StyledCodeSection = styled('div')(({ theme }) => ({
    overflowX: 'auto',
    '& code': {
        wordWrap: 'break-word',
        whiteSpace: 'pre-wrap',
        fontFamily: 'monospace',
        lineHeight: 1.5,
        fontSize: theme.fontSizes.smallBody,
    },
}));

const DeleteReleasePlan: FC<{
    change: IChangeRequestDeleteReleasePlan;
    environmentName: string;
    featureName: string;
    projectId: string;
    changeRequestState: ChangeRequestState;
    actions?: ReactNode;
}> = ({
    change,
    environmentName,
    featureName,
    projectId,
    changeRequestState,
    actions,
}) => {
    const { releasePlans } = useReleasePlans(
        projectId,
        featureName,
        environmentName,
    );
    const currentReleasePlan = releasePlans[0];

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
                        - Deleting release plan:
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
    environmentName: string;
    featureName: string;
    projectId: string;
    changeRequestState: ChangeRequestState;
    actions?: ReactNode;
}> = ({
    change,
    environmentName,
    featureName,
    projectId,
    changeRequestState,
    actions,
}) => {
    const { releasePlans } = useReleasePlans(
        projectId,
        featureName,
        environmentName,
    );
    const currentReleasePlan = releasePlans[0];

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
        <>
            <ChangeItemCreateEditDeleteWrapper>
                <ChangeItemInfo>
                    <Typography color='success.dark'>
                        + Start milestone:
                    </Typography>
                    <Typography>{newMilestone.name}</Typography>
                    <TooltipLink
                        tooltip={
                            <StyledCodeSection>
                                <EventDiff
                                    entry={{
                                        preData: previousMilestone,
                                        data: newMilestone,
                                    }}
                                />
                            </StyledCodeSection>
                        }
                        tooltipProps={{
                            maxWidth: 500,
                            maxHeight: 600,
                        }}
                    >
                        <ViewDiff>View Diff</ViewDiff>
                    </TooltipLink>
                </ChangeItemInfo>
                <div>{actions}</div>
            </ChangeItemCreateEditDeleteWrapper>
            <ReleasePlanMilestone readonly milestone={newMilestone} />
        </>
    );
};

const AddReleasePlan: FC<{
    change: IChangeRequestAddReleasePlan;
    environmentName: string;
    featureName: string;
    actions?: ReactNode;
}> = ({ change, environmentName, featureName, actions }) => {
    const { template } = useReleasePlanTemplate(change.payload.templateId);

    if (!template) return;

    const tentativeReleasePlan = {
        ...template,
        environment: environmentName,
        featureName,
        milestones: template.milestones.map((milestone) => ({
            ...milestone,
            releasePlanDefinitionId: template.id,
            strategies: (milestone.strategies || []).map((strategy) => ({
                ...strategy,
                parameters: {
                    ...strategy.parameters,
                    ...(strategy.parameters.groupId && {
                        groupId: String(strategy.parameters.groupId).replaceAll(
                            '{{featureName}}',
                            featureName,
                        ),
                    }),
                },
                milestoneId: milestone.id,
            })),
        })),
    };

    return (
        <>
            <ChangeItemCreateEditDeleteWrapper>
                <ChangeItemInfo>
                    <Typography color='success.dark'>
                        + Adding release plan:
                    </Typography>
                    <Typography>{template.name}</Typography>
                </ChangeItemInfo>
                <div>{actions}</div>
            </ChangeItemCreateEditDeleteWrapper>
            <ReleasePlan plan={tentativeReleasePlan} readonly />
        </>
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
    return (
        <>
            {change.action === 'addReleasePlan' && (
                <AddReleasePlan
                    change={change}
                    environmentName={environmentName}
                    featureName={featureName}
                    actions={actions}
                />
            )}
            {change.action === 'deleteReleasePlan' && (
                <DeleteReleasePlan
                    change={change}
                    environmentName={environmentName}
                    featureName={featureName}
                    projectId={projectId}
                    changeRequestState={changeRequestState}
                    actions={actions}
                />
            )}
            {change.action === 'startMilestone' && (
                <StartMilestone
                    change={change}
                    environmentName={environmentName}
                    featureName={featureName}
                    projectId={projectId}
                    changeRequestState={changeRequestState}
                    actions={actions}
                />
            )}
        </>
    );
};
