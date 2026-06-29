import { useNavigate } from 'react-router';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, it, vi } from 'vitest';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { FlightRecorderProvider } from './FlightRecorderProvider';

// The flight recorder SDK is third-party; stub it at its module boundary so the
// events the provider would ship are captured here instead of gzipped and sent
// over the network (which jsdom can't do). Everything we own — the provider, the
// tracking hook, the route table — stays real.
const { recorded } = vi.hoisted(() => ({ recorded: [] as { path: string }[] }));
vi.mock('@unleash/sdk-flight-recorder', () => ({
    createFlightRecorder: () => ({
        record: (event: { payload: { path: string } }) =>
            recorded.push(event.payload),
        flush: async () => {},
        close: async () => {},
    }),
}));

const server = testServerSetup();

// Turn the flag on (its payload carries the recorder URL the provider needs to
// build a recorder) and load an identity, so the first pageview clears the gate
// that holds it until userId is known.
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
        <FlightRecorderProvider>
            <NavigateButton />
        </FlightRecorderProvider>,
        { route: '/projects/default/settings' },
    );

    // Wait for the landing pageview before navigating: the first one is held
    // until the identity gate opens, and navigating earlier would skip it.
    await waitFor(() =>
        expect(recordedPaths()).toContain('/projects/:projectId/settings'),
    );
    await userEvent.click(
        screen.getByRole('button', { name: 'go to feature edit' }),
    );

    // Both routes, in order, with concrete ids kept out of the path: the landing
    // one proves the provider mounts the tracking hook, the second proves a route
    // change fires an event.
    await waitFor(() =>
        expect(recordedPaths()).toEqual([
            '/projects/:projectId/settings',
            '/projects/:projectId/features/:featureId/edit',
        ]),
    );
});
