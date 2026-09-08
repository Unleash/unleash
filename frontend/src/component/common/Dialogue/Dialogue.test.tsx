import type { ComponentProps } from 'react';
import { fireEvent, screen } from '@testing-library/react';
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
