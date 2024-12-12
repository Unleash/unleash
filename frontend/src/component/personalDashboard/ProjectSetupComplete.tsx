import { styled, Typography } from '@mui/material';
import type { FC } from 'react';
import { Link } from 'react-router-dom';
import Lightbulb from '@mui/icons-material/LightbulbOutlined';
import type { PersonalDashboardProjectDetailsSchemaInsights } from '../../openapi';
import { ActionBox } from './ActionBox';

const PercentageScore = styled('span')(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
}));

const ConnectedSdkProject: FC<{ project: string }> = ({ project }) => {
    return (
        <>
            <Typography>
                This project already has connected SDKs and existing feature
                flags.
            </Typography>
            <Typography>
                <Link to={`/projects/${project}?create=true`}>
                    Create a new feature flag
                </Link>{' '}
                or go to the{' '}
                <Link to={`/projects/${project}`} title={project}>
                    go to the project
                </Link>{' '}
                to work with existing flags
            </Typography>
        </>
    );
};

type HealthTrend = 'consistent' | 'improved' | 'declined' | 'unknown';

const determineProjectHealthTrend = (
    insights: PersonalDashboardProjectDetailsSchemaInsights,
): HealthTrend => {
    const { avgHealthCurrentWindow, avgHealthPastWindow } = insights;

    if (avgHealthCurrentWindow === null || avgHealthPastWindow === null) {
        return 'unknown';
    }

    if (avgHealthCurrentWindow > avgHealthPastWindow) {
        return 'improved';
    }

    if (avgHealthCurrentWindow < avgHealthPastWindow) {
        return 'declined';
    }

    return 'consistent';
};

const ProjectHealthMessage: FC<{
    trend: HealthTrend;
    insights: PersonalDashboardProjectDetailsSchemaInsights;
    project: string;
}> = ({ trend, insights, project }) => {
    const { avgHealthCurrentWindow, avgHealthPastWindow, health } = insights;
    const improveMessage =
        'Remember to archive your stale feature flags to keep the project health growing.';
    const keepDoingMessage =
        'This indicates that you are doing a good job of archiving your feature flags.';

    if (trend === 'improved') {
        return (
            <>
                <Typography>
                    On average, your project health went up from{' '}
                    <PercentageScore>{avgHealthPastWindow}%</PercentageScore> to{' '}
                    <PercentageScore>{avgHealthCurrentWindow}%</PercentageScore>{' '}
                    during the last 4 weeks.
                </Typography>
                <Typography>{keepDoingMessage}</Typography>
            </>
        );
    }

    if (trend === 'declined') {
        return (
            <>
                <Typography>
                    On average, your project health went down from{' '}
                    <PercentageScore>{avgHealthPastWindow}%</PercentageScore> to{' '}
                    <PercentageScore>{avgHealthCurrentWindow}%</PercentageScore>{' '}
                    during the last 4 weeks.
                </Typography>
                <Typography>{improveMessage}</Typography>
            </>
        );
    }

    if (trend === 'consistent') {
        return (
            <>
                <Typography>
                    On average, your project health has remained at{' '}
                    <PercentageScore>{avgHealthCurrentWindow}%</PercentageScore>{' '}
                    during the last 4 weeks.
                </Typography>
                <Typography>
                    {avgHealthCurrentWindow && avgHealthCurrentWindow >= 75
                        ? keepDoingMessage
                        : improveMessage}
                </Typography>
            </>
        );
    }

    if (trend === 'unknown') {
        return (
            <>
                <Typography>
                    Your current health score is{' '}
                    <PercentageScore>{health}%</PercentageScore>.
                </Typography>
                <Typography>
                    {health >= 75 ? keepDoingMessage : improveMessage}
                </Typography>
            </>
        );
    }

    return <ConnectedSdkProject project={project} />;
};

export const ProjectSetupComplete: FC<{
    project: string;
    insights: PersonalDashboardProjectDetailsSchemaInsights;
}> = ({ project, insights }) => {
    const projectHealthTrend = determineProjectHealthTrend(insights);

    return (
        <ActionBox
            title={
                <>
                    <Lightbulb color='primary' />
                    <Typography sx={{ fontWeight: 'bold' }} component='h4'>
                        Project health
                    </Typography>
                </>
            }
        >
            <ProjectHealthMessage
                trend={projectHealthTrend}
                insights={insights}
                project={project}
            />

            {projectHealthTrend !== 'unknown' && (
                <Link to={`/projects/${project}/insights`}>
                    View more insights
                </Link>
            )}
        </ActionBox>
    );
};
