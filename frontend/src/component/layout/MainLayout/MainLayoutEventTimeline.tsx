import { Box } from '@mui/material';
import { EventTimeline } from 'component/events/EventTimeline/EventTimeline';
import { useEffect, useState } from 'react';

interface IMainLayoutEventTimelineProps {
    open: boolean;
}

export const MainLayoutEventTimeline = ({
    open,
}: IMainLayoutEventTimelineProps) => {
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    useEffect(() => {
        setIsInitialLoad(false);
    }, []);

    return (
        <Box
            sx={{
                overflow: 'hidden',
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
                <EventTimeline />
            </Box>
        </Box>
    );
};
