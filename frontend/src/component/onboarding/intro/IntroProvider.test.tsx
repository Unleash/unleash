import { fireEvent, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { expect, test, vi } from 'vitest';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import {
    IntroProvider,
    ONBOARDING_INTRO_FINISHED_SPLASH_ID,
    useIntro,
} from './IntroProvider.tsx';

vi.mock('./IntroDialog.tsx', () => ({
    IntroDialog: ({
        open,
        onFinish,
    }: {
        open: boolean;
        onClose: () => void;
        onFinish: () => void;
    }) =>
        open ? (
            <button type='button' onClick={onFinish}>
                Finish
            </button>
        ) : null,
}));

const server = testServerSetup();

const Consumer = () => {
    const { open } = useIntro();
    return (
        <button type='button' onClick={() => open()}>
            Open
        </button>
    );
};

test('remembers the intro as finished for returning users', async () => {
    testServerRoute(server, '/api/admin/ui-config', {
        flags: { quickTourDemo: true },
    });
    const splashCalls: string[] = [];
    server.use(
        http.post('/api/admin/splash/:id', ({ params }) => {
            splashCalls.push(params.id as string);
            return HttpResponse.json({}, { status: 200 });
        }),
    );

    render(
        <IntroProvider>
            <Consumer />
        </IntroProvider>,
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Open' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Finish' }));

    await vi.waitFor(() =>
        expect(splashCalls).toEqual([ONBOARDING_INTRO_FINISHED_SPLASH_ID]),
    );
});
