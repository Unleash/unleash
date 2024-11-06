import { IconButton, Tooltip } from '@mui/material';
import LinearScaleIcon from '@mui/icons-material/LinearScale';
import { useEventTimelineContext } from 'component/events/EventTimeline/EventTimelineContext';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { Highlight } from 'component/common/Highlight/Highlight';

export const HeaderEventTimelineButton = () => {
    const { trackEvent } = usePlausibleTracker();
    const { isOss } = useUiConfig();
    const { open: showTimeline, setOpen: setShowTimeline } =
        useEventTimelineContext();

    if (isOss()) return null;

    return (
        <Tooltip
            title={showTimeline ? 'Hide event timeline' : 'Show event timeline'}
            arrow
        >
            <Highlight highlightKey='eventTimeline'>
                <IconButton
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
                </IconButton>
            </Highlight>
        </Tooltip>
    );
};
