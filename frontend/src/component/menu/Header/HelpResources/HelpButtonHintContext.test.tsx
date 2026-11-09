import { beforeEach, expect, test } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
    HelpButtonHintProvider,
    useHelpButtonHint,
} from './HelpButtonHintContext.tsx';

const Probe = () => {
    const { activeHint, showHint, dismissHint } = useHelpButtonHint();
    return (
        <div>
            <span data-testid='active'>{activeHint ?? 'none'}</span>
            <button type='button' onClick={() => showHint('get-started')}>
                show get-started
            </button>
            <button type='button' onClick={() => showHint('intro-closed')}>
                show intro-closed
            </button>
            <button type='button' onClick={dismissHint}>
                dismiss
            </button>
        </div>
    );
};

const renderProbe = () =>
    render(
        <HelpButtonHintProvider>
            <Probe />
        </HelpButtonHintProvider>,
    );

beforeEach(() => {
    window.localStorage.clear();
});

test('replaces the active hint when a second one is shown', async () => {
    renderProbe();

    await userEvent.click(
        screen.getByRole('button', { name: 'show get-started' }),
    );
    expect(screen.getByTestId('active')).toHaveTextContent('get-started');

    await userEvent.click(
        screen.getByRole('button', { name: 'show intro-closed' }),
    );
    expect(screen.getByTestId('active')).toHaveTextContent('intro-closed');
});

test('stays hidden on remount for a kind the user already dismissed', async () => {
    const { unmount } = renderProbe();
    await userEvent.click(
        screen.getByRole('button', { name: 'show get-started' }),
    );
    await userEvent.click(screen.getByRole('button', { name: 'dismiss' }));
    unmount();

    renderProbe();
    await userEvent.click(
        screen.getByRole('button', { name: 'show get-started' }),
    );
    expect(screen.getByTestId('active')).toHaveTextContent('none');
});

test('dismisses on window resize so the popper never strands from its anchor', async () => {
    renderProbe();
    await userEvent.click(
        screen.getByRole('button', { name: 'show get-started' }),
    );
    expect(screen.getByTestId('active')).toHaveTextContent('get-started');

    act(() => {
        window.dispatchEvent(new Event('resize'));
    });

    expect(screen.getByTestId('active')).toHaveTextContent('none');
});

test('dismisses one kind without silencing the others', async () => {
    const { unmount } = renderProbe();
    await userEvent.click(
        screen.getByRole('button', { name: 'show get-started' }),
    );
    await userEvent.click(screen.getByRole('button', { name: 'dismiss' }));
    unmount();

    renderProbe();
    await userEvent.click(
        screen.getByRole('button', { name: 'show intro-closed' }),
    );
    expect(screen.getByTestId('active')).toHaveTextContent('intro-closed');
});
