import { ProjectHealthChart } from './ProjectHealthChart';
import { Alert, Box, styled, Typography, useTheme } from '@mui/material';
import { Link } from 'react-router-dom';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import type { ProjectInsightsSchemaHealth } from '../../../../../openapi';
import type { FC } from 'react';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

const Dot = styled('span', {
    shouldForwardProp: (prop) => prop !== 'color',
})<{ color?: string }>(({ theme, color }) => ({
    height: '15px',
    width: '15px',
    borderRadius: '50%',
    display: 'inline-block',
    backgroundColor: color,
}));

const FlagsCount = styled('p')(({ theme }) => ({
    color: theme.palette.text.secondary,
    marginLeft: theme.spacing(3),
}));

const FlagCounts = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
}));

const Container = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
}));

const StatusWithDot = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

export const ProjectHealth: FC<{ health: ProjectInsightsSchemaHealth }> = ({
    health,
}) => {
    const theme = useTheme();
    const projectId = useRequiredPathParam('projectId');
    const { staleCount, potentiallyStaleCount, activeCount, rating } = health;

    return (
        <Container>
            <Typography variant='h3'>Project Health</Typography>
            <ConditionallyRender
                condition={staleCount > 0}
                show={
                    <Alert severity='warning'>
                        <b>Health alert!</b> Review your flags and delete the
                        stale flags
                    </Alert>
                }
            />

            <Box
                data-loading
                sx={(theme) => ({
                    display: 'flex',
                    gap: theme.spacing(4),
                    marginTop: theme.spacing(3),
                })}
            >
                <ProjectHealthChart
                    active={activeCount}
                    stale={staleCount}
                    potentiallyStale={potentiallyStaleCount}
                    health={rating}
                />
                <FlagCounts>
                    <Box>
                        <StatusWithDot>
                            <Dot color={theme.palette.success.border} />
                            <Box sx={{ fontWeight: 'bold' }}>Active</Box>
                        </StatusWithDot>
                        <FlagsCount>{activeCount} feature flags</FlagsCount>
                    </Box>
                    <Box>
                        <StatusWithDot>
                            <Dot color={theme.palette.warning.border} />
                            <Box sx={{ fontWeight: 'bold' }}>
                                Potentially stale
                            </Box>
                            <Link to='/feature-toggle-type'>(configure)</Link>
                        </StatusWithDot>
                        <FlagsCount>
                            {potentiallyStaleCount} feature flags
                        </FlagsCount>
                    </Box>
                    <Box>
                        <StatusWithDot>
                            <Dot color={theme.palette.error.border} />
                            <Box sx={{ fontWeight: 'bold' }}>Stale</Box>
                            <Link
                                to={`/projects/${projectId}?state=IS%3Astale`}
                            >
                                (view flags)
                            </Link>
                        </StatusWithDot>
                        <FlagsCount>{staleCount} feature flags</FlagsCount>
                    </Box>
                </FlagCounts>
            </Box>
        </Container>
    );
};
