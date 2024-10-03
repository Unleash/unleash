import { alpha, Box, styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { EventTimeline } from 'component/events/EventTimeline/EventTimeline';
import { useEventTimelineContext } from 'component/events/EventTimeline/EventTimelineContext';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useUiFlag } from 'hooks/useUiFlag';
import { useEffect, useState } from 'react';

const StyledEventTimelineSlider = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'highlighted',
})<{ highlighted?: boolean }>(({ theme, highlighted }) => ({
    backgroundColor: theme.palette.background.paper,
    height: '120px',
    overflow: 'hidden',
    boxShadow: theme.boxShadows.popup,
    borderLeft: `1px solid ${theme.palette.background.application}`,
    animation: highlighted ? 'highlight 1s infinite' : 'none',
    willChange: 'transform, box-shadow, opacity',
    '@keyframes highlight': {
        '0%': {
            zIndex: theme.zIndex.tooltip,
            transform: 'scale(1)',
            opacity: 1,
        },
        '50%': {
            zIndex: theme.zIndex.tooltip,
            'box-shadow': `0 0 30px ${alpha(theme.palette.primary.main, 0.8)}`,
            transform: 'scale(1.02)',
            opacity: 0.8,
        },
        '100%': {
            zIndex: theme.zIndex.tooltip,
            'box-shadow': theme.boxShadows.popup,
            transform: 'scale(1)',
            opacity: 1,
        },
    },
}));

const StyledEventTimelineWrapper = styled(Box)(({ theme }) => ({
    padding: theme.spacing(1.5, 2),
}));

export const MainLayoutEventTimeline = () => {
    const { isOss } = useUiConfig();
    const { open: showTimeline, highlighted } = useEventTimelineContext();
    const eventTimelineEnabled = useUiFlag('eventTimeline') && !isOss();
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    const open = showTimeline && eventTimelineEnabled;

    useEffect(() => {
        setIsInitialLoad(false);
    }, []);

    return (
        <StyledEventTimelineSlider
            highlighted={highlighted}
            sx={{
                transition: isInitialLoad
                    ? 'none'
                    : 'max-height 0.3s ease-in-out',
                maxHeight: open ? '120px' : '0',
            }}
        >
            <StyledEventTimelineWrapper>
                <ConditionallyRender
                    condition={open}
                    show={<EventTimeline />}
                />
            </StyledEventTimelineWrapper>
        </StyledEventTimelineSlider>
    );
};
