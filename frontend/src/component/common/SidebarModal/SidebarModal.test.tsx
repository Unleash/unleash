import { fireEvent, screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import {
    EventTrackerContext,
    type EventProps,
} from 'contexts/EventTrackerContext';
import { SIDEBAR_MODAL_ID } from 'utils/testIds';
import { expect, test } from 'vitest';
import { DynamicSidebarModal } from './SidebarModal.tsx';

const renderModal = () => {
    const rows: Array<{ event: string } & EventProps> = [];
    render(
        <EventTrackerContext.Provider
            value={{
                trackEvent: (event, options) =>
                    rows.push({ event, ...options?.props }),
            }}
        >
            <DynamicSidebarModal
                open={true}
                onClose={() => {}}
                label='Edit action'
                tracking={{ event: 'project-actions', type: 'edited' }}
            >
                <div>body</div>
            </DynamicSidebarModal>
        </EventTrackerContext.Provider>,
    );

    return rows;
};

test('tracks opening and the close icon as one journey', () => {
    const rows = renderModal();

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(rows).toEqual([
        { event: 'project-actions', eventType: 'edited', action: 'opened' },
        {
            event: 'project-actions',
            eventType: 'edited',
            action: 'dismissed',
            method: 'close-icon',
        },
    ]);
});

test('escape is a dismissal through the modal itself', () => {
    const rows = renderModal();

    fireEvent.keyDown(screen.getByTestId(SIDEBAR_MODAL_ID), { key: 'Escape' });

    expect(rows).toEqual([
        { event: 'project-actions', eventType: 'edited', action: 'opened' },
        {
            event: 'project-actions',
            eventType: 'edited',
            action: 'dismissed',
            method: 'escape',
        },
    ]);
});
