import { type Theme, styled } from '@mui/material';

export const releasePlanBackground = (theme: Theme) =>
    theme.palette.background.elevation2;
export const strategyBackground = (theme: Theme) =>
    theme.palette.background.elevation1;

export const StrategyListItem = styled('li')<{
    'data-type'?: 'release-plan' | 'strategy';
}>(({ theme, ...props }) => ({
    background:
        props['data-type'] === 'release-plan'
            ? releasePlanBackground(theme)
            : strategyBackground(theme),
}));
