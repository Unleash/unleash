import { beforeEach, expect, test, vi } from 'vitest';
import { render } from 'utils/testRenderer';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EventTrackerContext } from 'contexts/EventTrackerContext';
import { FeatureCopyName } from './FeatureCopyName.tsx';

const renderCopyName = (trackEvent: (...args: unknown[]) => void) =>
    render(
        <EventTrackerContext.Provider value={{ trackEvent }}>
            <FeatureCopyName name='my-flag' />
        </EventTrackerContext.Provider>,
    );

beforeEach(() => {
    // jsdom has no execCommand, and copy-to-clipboard falls back to a prompt without it
    document.execCommand = vi.fn(() => true);
});

test('tracks copying the flag name from the button', async () => {
    const trackEvent = vi.fn();
    renderCopyName(trackEvent);

    await userEvent.click(screen.getByRole('button'));

    expect(trackEvent).toHaveBeenCalledWith('flag-actions', {
        props: {
            eventType: 'name-copied',
            action: 'copied',
            name: 'my-flag',
            method: 'button',
        },
    });
});

test('tracks copying the flag name with the keyboard shortcut', async () => {
    const trackEvent = vi.fn();
    renderCopyName(trackEvent);

    await userEvent.keyboard('{Control>}c{/Control}');

    expect(trackEvent).toHaveBeenCalledWith('flag-actions', {
        props: {
            eventType: 'name-copied',
            action: 'copied',
            name: 'my-flag',
            method: 'keyboard-shortcut',
        },
    });
});

test('does not track when copying fails', async () => {
    document.execCommand = vi.fn(() => {
        throw new Error('nope');
    });
    // copy-to-clipboard's last-resort fallback; jsdom doesn't implement it
    window.prompt = vi.fn(() => null);
    const trackEvent = vi.fn();
    renderCopyName(trackEvent);

    await userEvent.click(screen.getByRole('button'));

    expect(trackEvent).not.toHaveBeenCalled();
});
