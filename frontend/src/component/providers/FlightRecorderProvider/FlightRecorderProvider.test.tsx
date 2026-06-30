import { useNavigate } from 'react-router';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, it } from 'vitest';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import type { FlightRecorder } from '@unleash/sdk-flight-recorder';
import { FlightRecorderProvider } from './FlightRecorderProvider';

const server = testServerSetup();

// In-memory stand-in for the SDK, injected via the provider's createRecorder prop.
// The real recorder gzips and POSTs over the network (jsdom can't); this captures
// what the provider would have shipped while provider, hook, and routes stay real.
const recorded: { path: string }[] = [];
const fakeRecorder = (): FlightRecorder =>
    ({
        record: (event) => recorded.push(event.payload as { path: string }),
        flush: async () => {},
        close: async () => {},
    }) as unknown as FlightRecorder;

// The flag payload carries the recorder URL, and the identity opens the gate that
// holds the first pageview until the userId is known.
const enableRecorder = () =>
    testServerRoute(server, '/api/admin/ui-config', {
        unleashContext: { userId: 'u-1' },
        flags: {
            flightRecorderFrontend: {
                name: 'flightRecorderFrontend',
                enabled: true,
                payload: {
                    type: 'string',
                    value: 'https://recorder.example/events',
                },
            },
        },
    });

const NavigateButton = () => {
    const navigate = useNavigate();
    return (
        <button
            type='button'
            onClick={() =>
                navigate('/projects/default/features/new-onboarding/edit')
            }
        >
            go to feature edit
        </button>
    );
};

const recordedPaths = () => recorded.map((payload) => payload.path);

beforeEach(() => {
    recorded.length = 0;
});

it('records a templated, low-cardinality pageview for each route the user visits', async () => {
    enableRecorder();

    render(
        <FlightRecorderProvider createRecorder={fakeRecorder}>
            <NavigateButton />
        </FlightRecorderProvider>,
        { route: '/projects/default/settings' },
    );

    // The landing pageview is gated on identity; navigating before it lands would skip it.
    await waitFor(() =>
        expect(recordedPaths()).toContain('/projects/:projectId/settings'),
    );
    await userEvent.click(
        screen.getByRole('button', { name: 'go to feature edit' }),
    );

    // Expect both routes, templated and in order: mounting wires up the tracking
    // hook, and the navigation fires the second event.
    await waitFor(() =>
        expect(recordedPaths()).toEqual([
            '/projects/:projectId/settings',
            '/projects/:projectId/features/:featureId/edit',
        ]),
    );
});
