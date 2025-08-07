import { Box, styled, Typography } from '@mui/material';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';
import type * as React from 'react';
import type { FC } from 'react';
import CloudCircle from '@mui/icons-material/CloudCircle';
import { ReactComponent as UsageRate } from 'assets/icons/usage-rate.svg';
import { FeatureLifecycleStageIcon } from 'component/common/FeatureLifecycle/FeatureLifecycleStageIcon';
import { TimeAgo } from 'component/common/TimeAgo/TimeAgo';
import { StyledIconWrapper } from '../../FeatureEnvironmentSeen/FeatureEnvironmentSeen.tsx';
import { useLastSeenColors } from '../../FeatureEnvironmentSeen/useLastSeenColors.ts';
import type { LifecycleStage } from './LifecycleStage.tsx';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import {
    DELETE_FEATURE,
    UPDATE_FEATURE,
} from 'component/providers/AccessProvider/permissions';
import { isSafeToArchive } from './isSafeToArchive.ts';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { formatDateYMDHMS } from 'utils/formatDate';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { getFeatureLifecycleName } from 'component/common/FeatureLifecycle/getFeatureLifecycleName';

const TimeLabel = styled('span')(({ theme }) => ({
    color: theme.palette.text.secondary,
}));

const InfoText = styled('p')(({ theme }) => ({
    paddingBottom: theme.spacing(1),
    color: theme.palette.text.primary,
}));

const MainLifecycleRow = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(2),
}));

const TimeLifecycleRow = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(1.5),
    gap: theme.spacing(1),
}));

const StyledFooter = styled('footer')(({ theme }) => ({
    background: theme.palette.neutral.light,
    color: theme.palette.text.secondary,
    borderRadius: `0 0 ${theme.shape.borderRadiusMedium}px ${theme.shape.borderRadiusMedium}px`, // has to match the parent tooltip container
    margin: theme.spacing(-1, -1.5), // has to match the parent tooltip container
    padding: theme.spacing(2, 3.5),
}));

const StyledEnvironmentUsageIcon = styled(StyledIconWrapper)(({ theme }) => ({
    width: theme.spacing(2),
    height: theme.spacing(2),
    marginRight: theme.spacing(0.75),
}));

const LastSeenIcon: FC<{
    lastSeen: string;
}> = ({ lastSeen }) => {
    const getColor = useLastSeenColors();
    const { text, background } = getColor(lastSeen);

    return (
        <StyledEnvironmentUsageIcon style={{ background }}>
            <UsageRate stroke={text} />
        </StyledEnvironmentUsageIcon>
    );
};

const EnvironmentLine = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    marginLeft: theme.spacing(3.5),
}));

const StyledEnvironmentsTitle = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    color: theme.palette.text.primary,
}));

const StyledEnvironmentIcon = styled(CloudCircle)(({ theme }) => ({
    color: theme.palette.primary.main,
    width: theme.spacing(2.5),
    display: 'block',
}));

const CenteredBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
}));

const StyledStageAction = styled(Box)(({ theme }) => ({
    marginTop: theme.spacing(2),
}));

const Environments: FC<{
    environments: Array<{
        name: string;
        lastSeenAt: string;
    }>;
}> = ({ environments }) => {
    return (
        <Box>
            {environments.map((environment) => {
                return (
                    <EnvironmentLine key={environment.name}>
                        <CenteredBox>
                            <Box>{environment.name}</Box>
                        </CenteredBox>
                        <CenteredBox>
                            <LastSeenIcon lastSeen={environment.lastSeenAt} />
                            <TimeAgo date={environment.lastSeenAt} />
                        </CenteredBox>
                    </EnvironmentLine>
                );
            })}
        </Box>
    );
};

const StyledStageActionTitle = styled(Typography)(({ theme }) => ({
    paddingTop: theme.spacing(0.5),
    marginBottom: theme.spacing(0.5),
    color: theme.palette.text.primary,
    fontSize: theme.fontSizes.smallerBody,
    fontWeight: theme.typography.fontWeightBold,
}));

const LiveStageAction: FC<{
    onComplete: () => void;
    loading: boolean;
    children?: React.ReactNode;
    project: string;
}> = ({ onComplete, loading, project }) => {
    return (
        <StyledStageAction>
            <StyledStageActionTitle>
                Is this feature complete?
            </StyledStageActionTitle>
            <InfoText sx={{ mb: 1 }}>
                Marking the feature flag as complete does not affect any
                configuration; however, it moves the flag to its next lifecycle
                stage and indicates that you have learned what you needed in
                order to progress.
            </InfoText>
            <PermissionButton
                variant='outlined'
                permission={UPDATE_FEATURE}
                size='small'
                onClick={onComplete}
                disabled={loading}
                projectId={project}
            >
                Mark completed
            </PermissionButton>
        </StyledStageAction>
    );
};

const ReadyForCleanupAction: FC<{
    onComplete: () => void;
    loading: boolean;
    project: string;
}> = ({ onComplete, loading, project }) => {
    return (
        <StyledStageAction>
            <StyledStageActionTitle>Ready for cleanup?</StyledStageActionTitle>
            <InfoText sx={{ mb: 1 }}>
                If this flag is no longer needed and ready to be removed from
                the code, you can mark it as ready for cleanup. This helps
                reduce technical debt.
            </InfoText>
            <PermissionButton
                variant='outlined'
                permission={UPDATE_FEATURE}
                size='small'
                onClick={onComplete}
                disabled={loading}
                projectId={project}
            >
                Mark ready for cleanup
            </PermissionButton>
        </StyledStageAction>
    );
};

const SafeToArchive: FC<{
    onArchive: () => void;
    onUncomplete: () => void;
    loading: boolean;
    project: string;
}> = ({ onArchive, onUncomplete, loading, project }) => {
    return (
        <StyledStageAction>
            <StyledStageActionTitle>Safe to archive</StyledStageActionTitle>
            <InfoText>
                We haven’t seen this feature flag in any environment for at
                least two days. It’s likely that it’s safe to archive this flag.
            </InfoText>
            <Box
                sx={(theme) => ({
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    gap: theme.spacing(2),
                    marginTop: theme.spacing(1),
                })}
            >
                <PermissionButton
                    variant='outlined'
                    permission={UPDATE_FEATURE}
                    size='small'
                    onClick={onUncomplete}
                    disabled={loading}
                    projectId={project}
                >
                    Revert to previous stage
                </PermissionButton>
                <PermissionButton
                    variant='outlined'
                    permission={DELETE_FEATURE}
                    size='small'
                    sx={{ mb: 2 }}
                    onClick={onArchive}
                    projectId={project}
                >
                    Archive feature
                </PermissionButton>
            </Box>
        </StyledStageAction>
    );
};

const ActivelyUsed: FC<{
    onUncomplete: () => void;
    loading: boolean;
}> = ({ onUncomplete, loading }) => (
    <StyledStageAction>
        <InfoText>
            This feature has been successfully completed, but we are still
            seeing usage. Clean up the feature flag from your code before
            archiving it.
        </InfoText>
        <InfoText>
            If you think this feature was completed too early you can revert to
            the previous stage.
        </InfoText>
        <PermissionButton
            variant='outlined'
            permission={UPDATE_FEATURE}
            size='small'
            sx={{ mb: 2 }}
            onClick={onUncomplete}
            disabled={loading}
        >
            Revert to previous stage
        </PermissionButton>
    </StyledStageAction>
);

const CompletedStageDescription: FC<{
    onArchive: () => void;
    onUncomplete: () => void;
    loading: boolean;
    environments: Array<{
        name: string;
        lastSeenAt: string;
    }>;
    project: string;
}> = ({ environments, onArchive, onUncomplete, loading, project }) => {
    if (isSafeToArchive(environments)) {
        return (
            <SafeToArchive
                onArchive={onArchive}
                onUncomplete={onUncomplete}
                loading={loading}
                project={project}
            />
        );
    }

    return <ActivelyUsed onUncomplete={onUncomplete} loading={loading} />;
};

const FormatTime: FC<{
    time: string;
}> = ({ time }) => {
    const { locationSettings } = useLocationSettings();

    return <span>{formatDateYMDHMS(time, locationSettings.locale)}</span>;
};

const FormatElapsedTime: FC<{
    time: string;
}> = ({ time }) => {
    const pastTime = parseISO(time);
    const elapsedTime = formatDistanceToNow(pastTime, { addSuffix: false });
    return <span>{elapsedTime}</span>;
};

const StageInfo: FC<{ stage: LifecycleStage['name'] }> = ({ stage }) => {
    if (stage === 'initial') {
        return (
            <InfoText>
                Feature flag has been created, but we have not seen any metrics
                yet.
            </InfoText>
        );
    }
    if (stage === 'pre-live') {
        return (
            <InfoText>
                Feature is being developed and tested in controlled
                environments.
            </InfoText>
        );
    }
    if (stage === 'live') {
        return (
            <InfoText>
                Feature is being rolled out in production according to an
                activation strategy.
            </InfoText>
        );
    }
    if (stage === 'completed') {
        return (
            <InfoText>
                When a flag is no longer needed, clean up the code to minimize
                technical debt and archive the flag for future reference.
            </InfoText>
        );
    }
    if (stage === 'archived') {
        return (
            <InfoText>
                Flag is archived in Unleash for future reference.
            </InfoText>
        );
    }

    return null;
};

const EnvironmentsInfo: FC<{
    stage: {
        name: LifecycleStage['name'];
        environments?: Array<{
            name: string;
            lastSeenAt: string;
        }>;
    };
}> = ({ stage }) => (
    <>
        <StyledEnvironmentsTitle>
            <StyledEnvironmentIcon />{' '}
            {stage.environments && stage.environments.length > 0
                ? `Seen in environment${stage.environments.length > 1 ? 's' : ''}`
                : 'Not seen in any environments'}
        </StyledEnvironmentsTitle>
        {stage.environments && stage.environments.length > 0 ? (
            <Environments environments={stage.environments!} />
        ) : null}
    </>
);

export const FeatureLifecycleTooltip: FC<{
    children: React.ReactElement<any, any>;
    stage: LifecycleStage;
    project: string;
    onArchive?: () => void;
    onComplete?: () => void;
    onUncomplete?: () => void;
    loading: boolean;
}> = ({
    children,
    stage,
    project,
    onArchive,
    onComplete,
    onUncomplete,
    loading,
}) => (
    <HtmlTooltip
        maxHeight={800}
        maxWidth={350}
        arrow
        tabIndex={0}
        title={
            <Box>
                <Box sx={(theme) => ({ padding: theme.spacing(2) })}>
                    <MainLifecycleRow>
                        <Typography variant='h3'>Lifecycle</Typography>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                            }}
                        >
                            <Typography variant='body2'>
                                {getFeatureLifecycleName(stage.name)}
                            </Typography>
                            <FeatureLifecycleStageIcon stage={stage} />
                        </Box>
                    </MainLifecycleRow>

                    <StageInfo stage={stage.name} />

                    <TimeLifecycleRow>
                        <TimeLabel>Stage entered at</TimeLabel>
                        <FormatTime time={stage.enteredStageAt} />
                    </TimeLifecycleRow>
                    <TimeLifecycleRow>
                        <TimeLabel>Time spent in stage</TimeLabel>
                        <FormatElapsedTime time={stage.enteredStageAt} />
                    </TimeLifecycleRow>
                </Box>
                {stage.name !== 'archived' ? (
                    <StyledFooter>
                        <EnvironmentsInfo stage={stage} />
                        {stage.name === 'live' && onComplete ? (
                            <LiveStageAction
                                onComplete={onComplete}
                                loading={loading}
                                project={project}
                            >
                                <Environments
                                    environments={stage.environments!}
                                />
                            </LiveStageAction>
                        ) : null}
                        {stage.name === 'completed' &&
                        onArchive &&
                        onUncomplete ? (
                            <CompletedStageDescription
                                environments={stage.environments!}
                                onArchive={onArchive}
                                onUncomplete={onUncomplete}
                                loading={loading}
                                project={project}
                            />
                        ) : null}
                        {(stage.name === 'initial' ||
                            stage.name === 'pre-live') &&
                        onComplete ? (
                            <ReadyForCleanupAction
                                onComplete={onComplete}
                                loading={loading}
                                project={project}
                            />
                        ) : null}
                    </StyledFooter>
                ) : null}
            </Box>
        }
    >
        <CenteredBox>{children}</CenteredBox>
    </HtmlTooltip>
);
