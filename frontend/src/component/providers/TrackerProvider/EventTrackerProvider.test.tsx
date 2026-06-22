import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EventTrackerProvider } from './EventTrackerProvider';
import { PlausibleContext } from 'contexts/PlausibleContext';
import { LogRocketContext } from 'contexts/LogRocketContext';
import { FlightRecorderContext } from 'contexts/FlightRecorderContext';
import { EventTrackerContext } from 'contexts/EventTrackerContext';
import { useContext } from 'react';
import { vi, expect, test } from 'vitest';

vi.mock('hooks/api/getters/useUiConfig/useUiConfig', () => ({
    default: () => ({ uiConfig: { unleashContext: { userId: 'u-1' } } }),
}));

const TrackButton = () => {
    const tracker = useContext(EventTrackerContext);
    return (
        <button
            type='button'
            onClick={() =>
                tracker?.trackEvent('invite', {
                    props: { eventType: 'test' },
                })
            }
        >
            track
        </button>
    );
};

test('trackEvent fans out to Plausible, LogRocket and the flight recorder', async () => {
    const plausibleTrack = vi.fn();
    const logRocketTrack = vi.fn();
    const record = vi.fn();

    render(
        <PlausibleContext.Provider
            value={{ trackEvent: plausibleTrack } as any}
        >
            <LogRocketContext.Provider value={{ track: logRocketTrack }}>
                <FlightRecorderContext.Provider value={{ record } as any}>
                    <EventTrackerProvider>
                        <TrackButton />
                    </EventTrackerProvider>
                </FlightRecorderContext.Provider>
            </LogRocketContext.Provider>
        </PlausibleContext.Provider>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'track' }));

    expect(plausibleTrack).toHaveBeenCalledWith('invite', {
        props: { eventType: 'test' },
    });
    expect(logRocketTrack).toHaveBeenCalledWith('invite', {
        eventType: 'test',
    });
    expect(record).toHaveBeenCalledWith({
        eventType: 'custom',
        eventName: 'invite',
        context: { userId: 'u-1' },
        payload: { eventType: 'test' },
    });
});
