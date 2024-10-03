import { Box, styled, useTheme } from '@mui/material';
import { Link } from 'react-router-dom';
import type { FC } from 'react';

const Dot = styled('span', {
    shouldForwardProp: (prop) => prop !== 'color',
})<{ color?: string }>(({ theme, color }) => ({
    height: '15px',
    width: '15px',
    borderRadius: '50%',
    display: 'inline-block',
    backgroundColor: color,
}));

const FlagCountsWrapper = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
}));

const FlagsCount = styled('p')(({ theme }) => ({
    color: theme.palette.text.secondary,
    marginLeft: theme.spacing(3),
}));

const StatusWithDot = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

export const FlagCounts: FC<{
    projectId: string;
    activeCount: number;
    potentiallyStaleCount: number;
    staleCount: number;
    hideLinks?: boolean;
}> = ({
    projectId,
    activeCount,
    potentiallyStaleCount,
    staleCount,
    hideLinks = false,
}) => {
    const theme = useTheme();

    return (
        <FlagCountsWrapper>
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
                    <Box sx={{ fontWeight: 'bold' }}>Potentially stale</Box>
                    {hideLinks ? null : (
                        <Link to='/feature-toggle-type'>(configure)</Link>
                    )}
                </StatusWithDot>
                <FlagsCount>{potentiallyStaleCount} feature flags</FlagsCount>
            </Box>
            <Box>
                <StatusWithDot>
                    <Dot color={theme.palette.error.border} />
                    <Box sx={{ fontWeight: 'bold' }}>Stale</Box>
                    {hideLinks ? null : (
                        <Link to={`/projects/${projectId}?state=IS%3Astale`}>
                            (view flags)
                        </Link>
                    )}
                </StatusWithDot>
                <FlagsCount>{staleCount} feature flags</FlagsCount>
            </Box>
        </FlagCountsWrapper>
    );
};
