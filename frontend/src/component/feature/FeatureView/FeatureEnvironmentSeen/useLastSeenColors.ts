import { useTheme } from '@mui/material';
import { differenceInDays } from 'date-fns';

type Color = {
    background: string;
    text: string;
};

export const useLastSeenColors = (): ((
    date?: Date | number | string | null,
) => Color) => {
    const theme = useTheme();
    const colorsForUnknown = {
        background: theme.palette.seen.unknown,
        text: theme.palette.grey.A400,
    };

    return (date?: Date | number | string | null): Color => {
        if (!date) {
            return colorsForUnknown;
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

        return colorsForUnknown;
    };
};
