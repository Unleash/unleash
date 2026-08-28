import { act, fireEvent, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { beforeEach, expect, test, vi } from 'vitest';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import {
    IntroProvider,
    ONBOARDING_INTRO_FINISHED_SPLASH_ID,
    useIntro,
} from './IntroProvider.tsx';

type IntroDialogProps = {
    open: boolean;
    onClose: () => void;
    onExited: () => void;
    onFinish: () => void;
};

let latestDialogProps: IntroDialogProps | undefined;

vi.mock('./IntroDialog.tsx', () => ({
    IntroDialog: (props: IntroDialogProps) => {
        latestDialogProps = props;
        return props.open ? (
            <button type='button' onClick={props.onFinish}>
                Finish
            </button>
        ) : null;
    },
}));

const server = testServerSetup();

beforeEach(() => {
    latestDialogProps = undefined;
});

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
        flags: { onboardingIntroTour: true },
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

test('runs onExited after the dialog leave transition completes', async () => {
    testServerRoute(server, '/api/admin/ui-config', {
        flags: { onboardingIntroTour: true },
    });
    const onExited = vi.fn();
    const Opener = () => {
        const { open } = useIntro();
        return (
            <button type='button' onClick={() => open({ onExited })}>
                Open with onExited
            </button>
        );
    };

    render(
        <IntroProvider>
            <Opener />
        </IntroProvider>,
    );

    fireEvent.click(
        await screen.findByRole('button', { name: 'Open with onExited' }),
    );
    await screen.findByRole('button', { name: 'Finish' });
    expect(onExited).not.toHaveBeenCalled();

    act(() => latestDialogProps?.onExited());

    expect(onExited).toHaveBeenCalledTimes(1);
});

test('drops the pending onExited when open() is called again without one', async () => {
    testServerRoute(server, '/api/admin/ui-config', {
        flags: { onboardingIntroTour: true },
    });
    const onExited = vi.fn();
    const Opener = () => {
        const { open } = useIntro();
        return (
            <>
                <button type='button' onClick={() => open({ onExited })}>
                    Open with onExited
                </button>
                <button type='button' onClick={() => open()}>
                    Open without
                </button>
            </>
        );
    };

    render(
        <IntroProvider>
            <Opener />
        </IntroProvider>,
    );

    fireEvent.click(
        await screen.findByRole('button', { name: 'Open with onExited' }),
    );
    await screen.findByRole('button', { name: 'Finish' });
    fireEvent.click(screen.getByRole('button', { name: 'Open without' }));

    act(() => latestDialogProps?.onExited());

    expect(onExited).not.toHaveBeenCalled();
});
