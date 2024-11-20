import { Chip, styled } from '@mui/material';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useUiFlag } from 'hooks/useUiFlag';
import { useEventTimelineContext } from '../EventTimelineContext';
import { Link, useNavigate } from 'react-router-dom';
import SensorsIcon from '@mui/icons-material/Sensors';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { useSignalQuery } from 'hooks/api/getters/useSignalQuery/useSignalQuery';
import { startOfDay, sub } from 'date-fns';

const StyledTip = styled('div')({
    display: 'flex',
    alignItems: 'center',
});

const StyledSignalIcon = styled(SensorsIcon)(({ theme }) => ({
    '&&&': {
        color: theme.palette.primary.main,
    },
}));

const signalsLink = '/integrations/signals';

const toISODateString = (date: Date) => date.toISOString().split('T')[0];

export const EventTimelineHeaderTip = () => {
    const navigate = useNavigate();
    const { timeSpan } = useEventTimelineContext();
    const endDate = new Date();
    const startDate = sub(endDate, timeSpan.value);
    const { signals, loading: signalsLoading } = useSignalQuery({
        from: `IS:${toISODateString(startOfDay(startDate))}`,
        to: `IS:${toISODateString(endDate)}`,
    });
    const { signalsSuggestionSeen, setSignalsSuggestionSeen } =
        useEventTimelineContext();

    const { isEnterprise } = useUiConfig();
    const signalsEnabled = useUiFlag('signals');
    const { trackEvent } = usePlausibleTracker();

    if (
        !signalsSuggestionSeen &&
        isEnterprise() &&
        signalsEnabled &&
        !signalsLoading &&
        signals.length === 0
    ) {
        return (
            <StyledTip>
                <Chip
                    size='small'
                    icon={<StyledSignalIcon />}
                    label={
                        <>
                            See <Link to={signalsLink}>signals</Link> from
                            external sources in real-time within Unleash
                        </>
                    }
                    onClick={() => {
                        trackEvent('event-timeline', {
                            props: {
                                eventType: 'signals clicked',
                            },
                        });
                        navigate(signalsLink);
                    }}
                    onDelete={() => setSignalsSuggestionSeen(true)}
                />
            </StyledTip>
        );
    }

    return null;
};
