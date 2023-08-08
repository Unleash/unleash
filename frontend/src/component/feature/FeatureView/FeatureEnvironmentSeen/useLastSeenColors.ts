import { useTheme } from '@mui/material';

export const useLastSeenColors = () => {
    const theme = useTheme();

    return (unit?: string): [string, string] => {
        switch (unit) {
            case 'second':
            case 'minute':
            case 'hour':
            case 'day':
                return [theme.palette.seen.recent, theme.palette.success.main];
            case 'week':
                return [
                    theme.palette.seen.inactive,
                    theme.palette.warning.main,
                ];
            case 'month':
            case 'year':
                return [theme.palette.seen.abandoned, theme.palette.error.main];
            default:
                return [theme.palette.seen.unknown, theme.palette.grey.A400];
        }
    };
};
