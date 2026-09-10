import type { ComponentProps } from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import {
    EventTrackerContext,
    type EventProps,
} from 'contexts/EventTrackerContext';
import { Dialogue } from './Dialogue.tsx';
import { expect, test, vi } from 'vitest';

const renderDialogue = (props: Partial<ComponentProps<typeof Dialogue>>) => {
    const rows: Array<{ event: string } & EventProps> = [];
    render(
        <EventTrackerContext.Provider
            value={{
                trackEvent: (event, options) =>
                    rows.push({ event, ...options?.props }),
            }}
        >
            <Dialogue open={true} title='New dialogue created' {...props} />
        </EventTrackerContext.Provider>,
    );

    return rows;
};

test('modal should close when escape is pressed', () => {
    const mockSetOpen = vi.fn();
    render(
        <Dialogue
            open={true}
            setOpen={mockSetOpen}
            title={'New dialogue created'}
        />,
    );

    expect(screen.getByText('New dialogue created')).toBeInTheDocument();

    const dialogue = screen.getByRole('dialog');
    fireEvent.keyDown(dialogue, { key: 'Escape', code: 'Escape' });

    expect(mockSetOpen).toHaveBeenCalledWith(false);
});

test('tracks opening and dismissing as one journey', () => {
    const rows = renderDialogue({
        tracking: { event: 'project-access', type: 'removed' },
        onClose: () => {},
    });

    fireEvent.click(screen.getByRole('button', { name: 'No, take me back' }));

    expect(rows).toEqual([
        { event: 'project-access', eventType: 'removed', action: 'opened' },
        {
            event: 'project-access',
            eventType: 'removed',
            action: 'dismissed',
            method: 'cancel-button',
        },
    ]);
});

test('escape is dismissed once even when both close paths are wired', () => {
    const rows = renderDialogue({
        tracking: { event: 'project-access', type: 'removed' },
        setOpen: () => {},
        onClose: () => {},
    });

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });

    expect(rows).toEqual([
        { event: 'project-access', eventType: 'removed', action: 'opened' },
        {
            event: 'project-access',
            eventType: 'removed',
            action: 'dismissed',
            method: 'escape',
        },
    ]);
});

test('an undeclared dialog emits nothing', () => {
    const rows = renderDialogue({ setOpen: () => {} });

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });

    expect(rows).toEqual([]);
});

test('a confirm that runs the request is tracked as one journey while the button waits for it', async () => {
    let finishRequest: () => void = () => {};
    const rows = renderDialogue({
        tracking: { event: 'project-access', type: 'removed' },
        onConfirm: () =>
            new Promise<void>((resolve) => {
                finishRequest = resolve;
            }),
    });
    const confirm = screen.getByRole('button', { name: "Yes, I'm sure" });

    fireEvent.click(confirm);

    expect(confirm).toBeDisabled();
    finishRequest();
    await waitFor(() => expect(confirm).toBeEnabled());
    expect(rows).toEqual([
        { event: 'project-access', eventType: 'removed', action: 'opened' },
        { event: 'project-access', eventType: 'removed', action: 'submitted' },
        { event: 'project-access', eventType: 'removed', action: 'succeeded' },
    ]);
});

test('a rejected confirm is recorded as failed and handed to the caller', async () => {
    const failure = new Error('request failed');
    const errors: unknown[] = [];
    const rows = renderDialogue({
        tracking: { event: 'project-access', type: 'removed' },
        onConfirm: () => Promise.reject(failure),
        onError: (error) => errors.push(error),
    });
    const confirm = screen.getByRole('button', { name: "Yes, I'm sure" });

    fireEvent.click(confirm);

    await waitFor(() => expect(confirm).toBeEnabled());
    expect(errors).toEqual([failure]);
    expect(rows).toMatchObject([
        { action: 'opened' },
        { action: 'submitted' },
        { action: 'failed', failedOn: 'request' },
    ]);
});
