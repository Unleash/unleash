import { styled, Typography } from '@mui/material';
import type { FC } from 'react';
import { Link } from 'react-router-dom';
import Lightbulb from '@mui/icons-material/LightbulbOutlined';
import type { PersonalDashboardProjectDetailsSchemaInsights } from '../../openapi';

const TitleContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    gap: theme.spacing(2),
    alignItems: 'center',
    justifyContent: 'center',
}));

const ActionBox = styled('article')(({ theme }) => ({
    padding: theme.spacing(4, 2),
    display: 'flex',
    gap: theme.spacing(3),
    flexDirection: 'column',
}));

const PercentageScore = styled('span')(({ theme }) => ({
    color: theme.palette.primary.main,
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

type HeathTrend = 'consistent' | 'improved' | 'declined' | 'unknown';

const determineProjectHealthTrend = (
    insights: PersonalDashboardProjectDetailsSchemaInsights,
): HeathTrend => {
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
    trend: HeathTrend;
    insights: PersonalDashboardProjectDetailsSchemaInsights;
    project: string;
}> = ({ trend, insights, project }) => {
    const { avgHealthCurrentWindow, avgHealthPastWindow } = insights;
    const improveMessage =
        'Remember to archive your stale feature flags to keep the project health growing.';
    const keepDoingMessage =
        'This indicates that you are doing a good job of arching your feature flags.';

    if (trend === 'improved') {
        return (
            <Typography>
                On average, your project health went up from{' '}
                <PercentageScore>{avgHealthPastWindow}%</PercentageScore> to{' '}
                <PercentageScore>{avgHealthCurrentWindow}%</PercentageScore>{' '}
                during the last 4 weeks. <br /> {keepDoingMessage}
            </Typography>
        );
    }

    if (trend === 'declined') {
        return (
            <Typography>
                On average, your project health went down from{' '}
                <PercentageScore>{avgHealthPastWindow}%</PercentageScore> to{' '}
                <PercentageScore>{avgHealthCurrentWindow}%</PercentageScore>{' '}
                during the last 4 weeks. <br /> {improveMessage}
            </Typography>
        );
    }

    if (trend === 'consistent') {
        return (
            <Typography>
                On average, your project health has remained at{' '}
                <PercentageScore>{avgHealthCurrentWindow}%</PercentageScore>{' '}
                during the last 4 weeks. <br />
                {avgHealthCurrentWindow && avgHealthCurrentWindow >= 70
                    ? keepDoingMessage
                    : improveMessage}
            </Typography>
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
        <ActionBox>
            <TitleContainer>
                <Lightbulb color='primary' />
                <h3>Project Insight</h3>
            </TitleContainer>

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
