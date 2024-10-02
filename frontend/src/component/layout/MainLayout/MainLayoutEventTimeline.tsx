import { Box, styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { EventTimeline } from 'component/events/EventTimeline/EventTimeline';
import { useEventTimelineContext } from 'component/events/EventTimeline/EventTimelineContext';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useUiFlag } from 'hooks/useUiFlag';
import { useEffect, useState } from 'react';

const StyledEventTimelineSlider = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    height: '105px',
    overflow: 'hidden',
    boxShadow: theme.boxShadows.popup,
    borderLeft: `1px solid ${theme.palette.divider}`,
}));

const StyledEventTimelineWrapper = styled(Box)(({ theme }) => ({
    padding: theme.spacing(1.5, 2),
}));

export const MainLayoutEventTimeline = () => {
    const { isOss } = useUiConfig();
    const { open: showTimeline } = useEventTimelineContext();
    const eventTimelineEnabled = useUiFlag('eventTimeline') && !isOss();
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    const open = showTimeline && eventTimelineEnabled;

    useEffect(() => {
        setIsInitialLoad(false);
    }, []);

    return (
        <StyledEventTimelineSlider
            sx={{
                transition: isInitialLoad
                    ? 'none'
                    : 'max-height 0.3s ease-in-out',
                maxHeight: open ? '105px' : '0',
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
