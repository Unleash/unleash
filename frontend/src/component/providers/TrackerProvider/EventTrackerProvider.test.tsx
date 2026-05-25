import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EventTrackerProvider } from './EventTrackerProvider';
import { PlausibleContext } from 'contexts/PlausibleContext';
import { LogRocketContext } from 'contexts/LogRocketContext';
import { EventTrackerContext } from 'contexts/EventTrackerContext';
import { useContext } from 'react';
import { vi, expect, test } from 'vitest';

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

test('trackEvent calls both Plausible and LogRocket', async () => {
    const plausibleTrack = vi.fn();
    const logRocketTrack = vi.fn();

    render(
        <PlausibleContext.Provider
            value={{ trackEvent: plausibleTrack } as any}
        >
            <LogRocketContext.Provider value={{ track: logRocketTrack }}>
                <EventTrackerProvider>
                    <TrackButton />
                </EventTrackerProvider>
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
});
