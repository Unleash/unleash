import { alpha, IconButton, styled, Tooltip } from '@mui/material';
import LinearScaleIcon from '@mui/icons-material/LinearScale';
import { useEventTimelineContext } from 'component/events/EventTimeline/EventTimelineContext';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';

const StyledHeaderEventTimelineButton = styled(IconButton, {
    shouldForwardProp: (prop) => prop !== 'highlighted',
})<{
    component?: 'a' | 'button';
    href?: string;
    target?: string;
    highlighted?: boolean;
}>(({ theme, highlighted }) => ({
    animation: highlighted ? 'pulse 1.5s infinite linear' : 'none',
    zIndex: highlighted ? theme.zIndex.tooltip : 'auto',
    '@keyframes pulse': {
        '0%': {
            boxShadow: `0 0 0 0px ${alpha(theme.palette.primary.main, 0.5)}`,
            transform: 'scale(1)',
        },
        '50%': {
            boxShadow: `0 0 0 15px ${alpha(theme.palette.primary.main, 0.2)}`,
            transform: 'scale(1.1)',
        },
        '100%': {
            boxShadow: `0 0 0 30px ${alpha(theme.palette.primary.main, 0)}`,
            transform: 'scale(1)',
        },
    },
}));

export const HeaderEventTimelineButton = () => {
    const { trackEvent } = usePlausibleTracker();
    const { isOss } = useUiConfig();
    const {
        open: showTimeline,
        setOpen: setShowTimeline,
        highlighted,
    } = useEventTimelineContext();

    if (isOss()) return null;

    return (
        <Tooltip
            title={showTimeline ? 'Hide event timeline' : 'Show event timeline'}
            arrow
        >
            <StyledHeaderEventTimelineButton
                highlighted={highlighted}
                onClick={() => {
                    trackEvent('event-timeline', {
                        props: {
                            eventType: showTimeline ? 'close' : 'open',
                        },
                    });
                    setShowTimeline(!showTimeline);
                }}
                size='large'
            >
                <LinearScaleIcon />
            </StyledHeaderEventTimelineButton>
        </Tooltip>
    );
};
