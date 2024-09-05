import { alpha, Avatar, styled } from '@mui/material';

export const PulsingAvatar = styled(Avatar, {
    shouldForwardProp: (prop) => prop !== 'active',
})<{ active: boolean }>(({ theme, active }) => ({
    transition: 'background-color 0.5s ease',
    color: theme.palette.common.white,
    backgroundColor: active
        ? theme.palette.primary.main
        : theme.palette.divider,
    '@keyframes pulse': {
        '0%': {
            boxShadow: `0 0 0 0px ${alpha(theme.palette.primary.main, 0.7)}`,
        },
        '100%': {
            boxShadow: `0 0 0 20px ${alpha(theme.palette.primary.main, 0.0)}`,
        },
    },
    animation: active ? 'pulse 2s infinite' : '',
}));

/**
 * Temporary component until we decide how all the colors will look like
 * Then we can use PulsingAvatar with a color prop perhaps
 * PulsingAvatar was not working nicely on purple background
 */
export const WhitePulsingAvatar = styled(Avatar, {
    shouldForwardProp: (prop) => prop !== 'active',
})<{ active: boolean }>(({ theme, active }) => ({
    transition: 'background-color 0.5s ease',
    color: theme.palette.primary.main,
    backgroundColor: active
        ? theme.palette.background.default
        : theme.palette.divider,
    '@keyframes pulse': {
        '0%': {
            boxShadow: `0 0 0 0px ${alpha(theme.palette.background.default, 0.7)}`,
        },
        '100%': {
            boxShadow: `0 0 0 20px ${alpha(theme.palette.background.default, 0.0)}`,
        },
    },
    animation: active ? 'pulse 2s infinite' : '',
}));
