import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useContext } from 'react';
import { vi, expect, test } from 'vitest';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { EventTrackerProvider } from './EventTrackerProvider';
import { PlausibleContext } from 'contexts/PlausibleContext';
import { FlightRecorderContext } from 'contexts/FlightRecorderContext';
import { EventTrackerContext } from 'contexts/EventTrackerContext';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

const server = testServerSetup();

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

const ConfigProbe = () => {
    const { uiConfig } = useUiConfig();
    return <span>ctx:{uiConfig?.unleashContext?.userId ?? 'none'}</span>;
};

test('trackEvent fans out to Plausible and the flight recorder', async () => {
    testServerRoute(server, '/api/admin/ui-config', {
        unleashContext: { userId: 'u-1', email: 'already-hashed-email' },
    });

    const plausibleTrack = vi.fn();
    const record = vi.fn();

    render(
        <PlausibleContext.Provider
            value={{ trackEvent: plausibleTrack } as any}
        >
            <FlightRecorderContext.Provider value={{ record } as any}>
                <EventTrackerProvider>
                    <ConfigProbe />
                    <TrackButton />
                </EventTrackerProvider>
            </FlightRecorderContext.Provider>
        </PlausibleContext.Provider>,
    );

    await screen.findByText('ctx:u-1');
    await userEvent.click(screen.getByRole('button', { name: 'track' }));

    expect(plausibleTrack).toHaveBeenCalledWith('invite', {
        props: { eventType: 'test' },
    });
    expect(record).toHaveBeenCalledWith({
        eventType: 'custom',
        eventName: 'invite',
        context: { userId: 'u-1', email: 'already-hashed-email' },
        payload: { eventType: 'test', path: '/' },
    });
});
