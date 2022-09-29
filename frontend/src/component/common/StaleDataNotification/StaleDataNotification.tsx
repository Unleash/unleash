import { Typography, Button, useTheme, useMediaQuery } from '@mui/material';
import EventDiff from 'component/events/EventDiff/EventDiff';
import { useThemeStyles } from 'themes/themeStyles';
import AnimateOnMount from 'component/common/AnimateOnMount/AnimateOnMount';

interface IStaleDataNotification {
    refresh: () => void;
    afterSubmitAction: () => void;
    data: unknown;
    cache: unknown;
    show: boolean;
}

export const StaleDataNotification = ({
    refresh,
    show,
    afterSubmitAction,
    data,
    cache,
}: IStaleDataNotification) => {
    const { classes: themeStyles } = useThemeStyles();
    const theme = useTheme();
    const isExtraSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const getStyles = () => {
        const base = {
            padding: `${theme.spacing(3)} ${theme.spacing(4)}`,
            boxShadow: theme.boxShadows.elevated,
            borderRadius: theme.shape.borderRadiusLarge,
            backgroundColor: theme.palette.background.paper,
            maxWidth: theme.spacing(75),
            zIndex: theme.zIndex.mobileStepper,
        };
        if (isExtraSmallScreen) {
            return {
                ...base,
                right: 0,
                left: 0,
                bottom: 0,
                borderRadius: 0,
            };
        }
        return base;
    };

    return (
        <AnimateOnMount
            mounted={show}
            start={themeStyles.fadeInBottomStartWithoutFixed}
            enter={themeStyles.fadeInBottomEnter}
            style={getStyles()}
        >
            <Typography variant="h5" sx={{ my: 2, mb: 2 }}>
                Your data is stale
            </Typography>
            <Typography variant="body1" sx={{ my: 2, mb: 3 }}>
                The data you have been working on is stale, would you like to
                refresh your data? This may happen if someone has been making
                changes to the data while you were working.
            </Typography>
            <EventDiff entry={{ preData: cache, data }} />
            <Button
                sx={{ mb: 2 }}
                variant="contained"
                color="primary"
                onClick={() => {
                    refresh();
                    afterSubmitAction();
                }}
            >
                Refresh data
            </Button>
        </AnimateOnMount>
    );
};
