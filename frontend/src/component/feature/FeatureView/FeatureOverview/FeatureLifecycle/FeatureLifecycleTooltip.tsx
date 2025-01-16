import { Box, styled, Typography } from '@mui/material';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';
import type * as React from 'react';
import type { FC } from 'react';
import CloudCircle from '@mui/icons-material/CloudCircle';
import { ReactComponent as UsageRate } from 'assets/icons/usage-rate.svg';
import { FeatureLifecycleStageIcon } from 'component/common/FeatureLifecycle/FeatureLifecycleStageIcon';
import { TimeAgo } from 'component/common/TimeAgo/TimeAgo';
import { StyledIconWrapper } from '../../FeatureEnvironmentSeen/FeatureEnvironmentSeen';
import { useLastSeenColors } from '../../FeatureEnvironmentSeen/useLastSeenColors';
import type { LifecycleStage } from './LifecycleStage';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import {
    DELETE_FEATURE,
    UPDATE_FEATURE,
} from 'component/providers/AccessProvider/permissions';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { isSafeToArchive } from './isSafeToArchive';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { formatDateYMDHMS } from 'utils/formatDate';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { getFeatureLifecycleName } from 'component/common/FeatureLifecycle/getFeatureLifecycleName';

const TimeLabel = styled('span')(({ theme }) => ({
    color: theme.palette.text.secondary,
}));

const InfoText = styled('p')(({ theme }) => ({
    paddingBottom: theme.spacing(2),
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

const IconsRow = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(6),
}));

const Line = styled(Box)(({ theme }) => ({
    height: '1px',
    background: theme.palette.divider,
    flex: 1,
}));

const StageBox = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'active',
})<{
    active?: boolean;
}>(({ theme, active }) => ({
    position: 'relative',
    // speech bubble triangle for active stage
    ...(active && {
        '&:before': {
            content: '""',
            position: 'absolute',
            display: 'block',
            borderStyle: 'solid',
            borderColor: `${theme.palette.primary.light} transparent`,
            borderWidth: '0 6px 6px',
            top: theme.spacing(3.25),
            left: theme.spacing(1.75),
        },
    }),
    // stage name text
    '&:after': {
        content: 'attr(data-after-content)',
        display: 'block',
        position: 'absolute',
        top: theme.spacing(4),
        left: theme.spacing(-1.25),
        right: theme.spacing(-1.25),
        textAlign: 'center',
        whiteSpace: 'nowrap',
        fontSize: theme.spacing(1.25),
        padding: theme.spacing(0.25, 0),
        color: theme.palette.text.secondary,
        // active wrapper for stage name text
        ...(active && {
            backgroundColor: theme.palette.primary.light,
            color: theme.palette.primary.contrastText,
            fontWeight: theme.typography.fontWeightBold,
            borderRadius: theme.spacing(0.5),
        }),
    },
}));

const StyledFooter = styled('footer')(({ theme }) => ({
    background: theme.palette.neutral.light,
    color: theme.palette.text.secondary,
    borderRadius: `0 0 ${theme.shape.borderRadiusMedium}px ${theme.shape.borderRadiusMedium}px`, // has to match the parent tooltip container
    margin: theme.spacing(-1, -1.5), // has to match the parent tooltip container
    padding: theme.spacing(2, 3.5),
}));

const LastSeenIcon: FC<{
    lastSeen: string;
}> = ({ lastSeen }) => {
    const getColor = useLastSeenColors();
    const { text, background } = getColor(lastSeen);

    return (
        <StyledIconWrapper style={{ background }}>
            <UsageRate stroke={text} />
        </StyledIconWrapper>
    );
};

const EnvironmentLine = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2),
}));

const CenteredBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
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
                            <CloudCircle />
                            <Box>{environment.name}</Box>
                        </CenteredBox>
                        <CenteredBox>
                            <TimeAgo date={environment.lastSeenAt} />
                            <LastSeenIcon lastSeen={environment.lastSeenAt} />
                        </CenteredBox>
                    </EnvironmentLine>
                );
            })}
        </Box>
    );
};

const BoldTitle = styled(Typography)(({ theme }) => ({
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    fontSize: theme.typography.body2.fontSize,
    fontWeight: theme.typography.fontWeightBold,
}));

const SafeToArchive: FC<{
    onArchive: () => void;
    onUncomplete: () => void;
    loading: boolean;
    project: string;
}> = ({ onArchive, onUncomplete, loading, project }) => {
    return (
        <>
            <BoldTitle>Safe to archive</BoldTitle>
            <InfoText
                sx={{
                    mt: 2,
                    mb: 1,
                }}
            >
                We haven’t seen this feature flag in any environment for at
                least two days. It’s likely that it’s safe to archive this flag.
            </InfoText>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    gap: 2,
                }}
            >
                <PermissionButton
                    color='inherit'
                    variant='outlined'
                    permission={UPDATE_FEATURE}
                    size='small'
                    onClick={onUncomplete}
                    disabled={loading}
                    projectId={project}
                >
                    Revert to live
                </PermissionButton>
                <PermissionButton
                    color='inherit'
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
        </>
    );
};

const ActivelyUsed: FC<{
    onUncomplete: () => void;
    loading: boolean;
    children?: React.ReactNode;
}> = ({ children, onUncomplete, loading }) => (
    <>
        <InfoText
            sx={{
                mt: 1,
                mb: 1,
            }}
        >
            This feature has been successfully completed, but we are still
            seeing usage. Clean up the feature flag from your code before
            archiving it:
        </InfoText>
        {children}
        <InfoText
            sx={{
                mt: 1,
                mb: 1,
            }}
        >
            If you think this feature was completed too early you can revert to
            the live stage:
        </InfoText>
        <PermissionButton
            color='inherit'
            variant='outlined'
            permission={UPDATE_FEATURE}
            size='small'
            sx={{ mb: 2 }}
            onClick={onUncomplete}
            disabled={loading}
        >
            Revert to live
        </PermissionButton>
    </>
);

const CompletedStageDescription: FC<{
    onArchive: () => void;
    onUncomplete: () => void;
    loading: boolean;
    environments: Array<{
        name: string;
        lastSeenAt: string;
    }>;
    children?: React.ReactNode;
    project: string;
}> = ({
    children,
    environments,
    onArchive,
    onUncomplete,
    loading,
    project,
}) => {
    return (
        <ConditionallyRender
            condition={isSafeToArchive(environments)}
            show={
                <SafeToArchive
                    onArchive={onArchive}
                    onUncomplete={onUncomplete}
                    loading={loading}
                    project={project}
                />
            }
            elseShow={
                <ActivelyUsed onUncomplete={onUncomplete} loading={loading}>
                    {children}
                </ActivelyUsed>
            }
        />
    );
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
                Feature is being rolled out in production according to the
                strategy/release plan.
            </InfoText>
        );
    }
    if (stage === 'completed') {
        return (
            <InfoText>
                Once longer needed, clean up the code to reduce technical debt
                and archive the flag.
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

export const FeatureLifecycleTooltip: FC<{
    children: React.ReactElement<any, any>;
    stage: LifecycleStage;
    project: string;
    onArchive: () => void;
    onComplete: () => void;
    onUncomplete: () => void;
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
                <StyledFooter>
                    {stage.environments && stage.environments.length > 0 ? (
                        <Environments environments={stage.environments} />
                    ) : null}
                    {/* {stage.name === 'initial' && <InitialStageDescription />}
                    {stage.name === 'pre-live' && (
                        <PreLiveStageDescription>
                            <Environments environments={stage.environments} />
                        </PreLiveStageDescription>
                    )}
                    {stage.name === 'live' && (
                        <LiveStageDescription
                            onComplete={onComplete}
                            loading={loading}
                            project={project}
                        >
                            <Environments environments={stage.environments} />
                        </LiveStageDescription>
                    )}
                    {stage.name === 'completed' && (
                        <CompletedStageDescription
                            environments={stage.environments}
                            onArchive={onArchive}
                            onUncomplete={onUncomplete}
                            loading={loading}
                            project={project}
                        >
                            <Environments environments={stage.environments} />
                        </CompletedStageDescription>
                    )}
                    {stage.name === 'archived' && <ArchivedStageDescription />} */}
                </StyledFooter>
            </Box>
        }
    >
        <CenteredBox>{children}</CenteredBox>
    </HtmlTooltip>
);
