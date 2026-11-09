import {
    Typography,
    Button,
    styled,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import { EventDiff } from 'component/events/EventDiff/EventDiff';
import {
    fadeInBottomEnter,
    fadeInBottomStartWithoutFixed,
} from 'themes/themeStyles';
import AnimateOnMount from 'component/common/AnimateOnMount/AnimateOnMount';
import { useMemo } from 'react';

const DiffContainer = styled('div')(({ theme }) => ({
    maxHeight: theme.spacing(40),
    overflowY: 'auto',
    marginBottom: theme.spacing(2),
}));

const Actions = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(2),
}));

interface IStaleDataNotification {
    refresh: () => void;
    dismiss: () => void;
    afterSubmitAction: () => void;
    data: unknown;
    cache: unknown;
    show: boolean;
}

export const StaleDataNotification = ({
    refresh,
    dismiss,
    show,
    afterSubmitAction,
    data,
    cache,
}: IStaleDataNotification) => {
    const theme = useTheme();
    const isExtraSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const style = useMemo(() => {
        const base = {
            ...fadeInBottomStartWithoutFixed,
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
    }, [theme, isExtraSmallScreen]);

    return (
        <AnimateOnMount mounted={show} start={style} enter={fadeInBottomEnter}>
            <Typography variant='h5' sx={{ my: 2, mb: 2 }}>
                Your data is stale
            </Typography>
            <Typography variant='body1' sx={{ my: 2, mb: 3 }}>
                The data you have been working on is stale, would you like to
                refresh your data? This may happen if someone has been making
                changes to the data while you were working.
            </Typography>
            <DiffContainer>
                <EventDiff entry={{ preData: cache, data }} />
            </DiffContainer>
            <Actions>
                <Button onClick={dismiss}>Dismiss</Button>
                <Button
                    variant='contained'
                    color='primary'
                    onClick={() => {
                        refresh();
                        afterSubmitAction();
                    }}
                >
                    Refresh data
                </Button>
            </Actions>
        </AnimateOnMount>
    );
};
