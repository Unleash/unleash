import { useTheme } from '@mui/material';
import { differenceInDays } from 'date-fns';

type Color = {
    background: string;
    text: string;
};

export const useLastSeenColors = (): ((
    date?: Date | number | string,
) => Color) => {
    const theme = useTheme();

    return (date?: Date | number | string): Color => {
        if (!date) {
            return {
                background: theme.palette.seen.unknown,
                text: theme.palette.grey.A400,
            };
        }

        try {
            const days = differenceInDays(Date.now(), new Date(date));

            if (days < 1) {
                return {
                    background: theme.palette.seen.recent,
                    text: theme.palette.success.main,
                };
            }
            if (days <= 7) {
                return {
                    background: theme.palette.seen.inactive,
                    text: theme.palette.warning.main,
                };
            }

            return {
                background: theme.palette.seen.abandoned,
                text: theme.palette.error.main,
            };
        } catch {}

        return {
            background: theme.palette.seen.unknown,
            text: theme.palette.grey.A400,
        };
    };
};
