import { styled, Typography } from '@mui/material';
import type { FC } from 'react';
import { Link } from 'react-router-dom';
import Lightbulb from '@mui/icons-material/LightbulbOutlined';
import type { PersonalDashboardProjectDetailsSchemaInsights } from 'openapi';
import { ActionBox } from './ActionBox.tsx';
import { useUiFlag } from 'hooks/useUiFlag.ts';

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
    const healthToTechDebtEnabled = useUiFlag('healthToTechDebt');
    const { avgHealthCurrentWindow, avgHealthPastWindow, health } = insights;
    const improveMessage = healthToTechDebtEnabled
        ? 'Remember to archive your stale feature flags to keep the technical debt low.'
        : 'Remember to archive your stale feature flags to keep the project health growing.';
    const keepDoingMessage =
        'This indicates that you are doing a good job of archiving your feature flags.';
    const avgCurrentTechnicalDebt = 100 - (avgHealthCurrentWindow ?? 0);
    const avgPastTechnicalDebt = 100 - (avgHealthPastWindow ?? 0);

    if (trend === 'improved') {
        if (healthToTechDebtEnabled) {
            return (
                <>
                    <Typography>
                        On average, your project technical debt went down from{' '}
                        <PercentageScore>
                            {avgPastTechnicalDebt}%
                        </PercentageScore>{' '}
                        to{' '}
                        <PercentageScore>
                            {avgCurrentTechnicalDebt}%
                        </PercentageScore>{' '}
                        during the last 4 weeks.
                    </Typography>
                    <Typography>{keepDoingMessage}</Typography>
                </>
            );
        }

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
        if (healthToTechDebtEnabled) {
            return (
                <>
                    <Typography>
                        On average, your project technical debt went up from{' '}
                        <PercentageScore>
                            {avgPastTechnicalDebt}%
                        </PercentageScore>{' '}
                        to{' '}
                        <PercentageScore>
                            {avgCurrentTechnicalDebt}%
                        </PercentageScore>{' '}
                        during the last 4 weeks.
                    </Typography>
                    <Typography>{improveMessage}</Typography>
                </>
            );
        }

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
        if (healthToTechDebtEnabled) {
            return (
                <>
                    <Typography>
                        On average, your project technical debt has remained at{' '}
                        <PercentageScore>
                            {avgCurrentTechnicalDebt}%
                        </PercentageScore>{' '}
                        during the last 4 weeks.
                    </Typography>
                    <Typography>{keepDoingMessage}</Typography>
                </>
            );
        }

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
        if (healthToTechDebtEnabled) {
            return (
                <>
                    <Typography>
                        Your current project technical debt is{' '}
                        <PercentageScore>
                            {avgCurrentTechnicalDebt}%
                        </PercentageScore>
                        .
                    </Typography>
                    <Typography>{improveMessage}</Typography>
                </>
            );
        }

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
    const healthToTechDebtEnabled = useUiFlag('healthToTechDebt');
    const projectHealthTrend = determineProjectHealthTrend(insights);

    return (
        <ActionBox
            title={
                <>
                    <Lightbulb color='primary' />
                    <Typography sx={{ fontWeight: 'bold' }} component='h4'>
                        {healthToTechDebtEnabled
                            ? 'Technical debt'
                            : 'Project health'}
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
                <Link to={`/projects/${project}?project-status`}>
                    View more insights
                </Link>
            )}
        </ActionBox>
    );
};
