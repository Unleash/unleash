import { Box, styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { EventTimeline } from 'component/events/EventTimeline/EventTimeline';
import type { TimeSpanOption } from 'component/events/EventTimeline/useEventTimeline';
import type { IEnvironment } from 'interfaces/environments';
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

interface IMainLayoutEventTimelineProps {
    open: boolean;
    timeSpan: TimeSpanOption;
    environment: IEnvironment | undefined;
    setTimeSpan: (timeSpan: TimeSpanOption) => void;
    setEnvironment: (environment: IEnvironment) => void;
    setOpen: (open: boolean) => void;
}

export const MainLayoutEventTimeline = ({
    open,
    timeSpan,
    environment,
    setTimeSpan,
    setEnvironment,
    setOpen,
}: IMainLayoutEventTimelineProps) => {
    const [isInitialLoad, setIsInitialLoad] = useState(true);

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
                    show={
                        <EventTimeline
                            timeSpan={timeSpan}
                            environment={environment}
                            setTimeSpan={setTimeSpan}
                            setEnvironment={setEnvironment}
                            setOpen={setOpen}
                        />
                    }
                />
            </StyledEventTimelineWrapper>
        </StyledEventTimelineSlider>
    );
};
