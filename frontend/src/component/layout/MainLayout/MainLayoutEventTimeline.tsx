import { Box, styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { EventTimeline } from 'component/events/EventTimeline/EventTimeline';
import { useEffect, useState } from 'react';

interface IMainLayoutEventTimelineProps {
    open: boolean;
}

const StyledEventTimelineWrapper = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    height: '105px',
    overflow: 'hidden',
}));

export const MainLayoutEventTimeline = ({
    open,
}: IMainLayoutEventTimelineProps) => {
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    useEffect(() => {
        setIsInitialLoad(false);
    }, []);

    return (
        <StyledEventTimelineWrapper
            sx={{
                transition: isInitialLoad
                    ? 'none'
                    : 'max-height 0.3s ease-in-out',
                maxHeight: open ? '105px' : '0',
            }}
        >
            <Box
                sx={(theme) => ({
                    padding: theme.spacing(2),
                    backgroundColor: theme.palette.background.paper,
                })}
            >
                <ConditionallyRender
                    condition={open}
                    show={<EventTimeline />}
                />
            </Box>
        </StyledEventTimelineWrapper>
    );
};
