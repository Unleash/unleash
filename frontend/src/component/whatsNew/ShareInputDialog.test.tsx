import { describe, expect, it, vi } from 'vitest';
import { render } from 'utils/testRenderer';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EventTrackerContext } from 'contexts/EventTrackerContext';
import { ShareInputDialog } from './ShareInputDialog.tsx';

const noop = () => {};

const renderDialog = (trackEvent: (...args: unknown[]) => void) =>
    render(
        <EventTrackerContext.Provider value={{ trackEvent }}>
            <ShareInputDialog
                open={true}
                onClose={noop}
                featureTitle='Service Now integration'
            />
        </EventTrackerContext.Provider>,
    );

describe('ShareInputDialog', () => {
    it('composes a mailto with the feature title in subject and body', () => {
        renderDialog(vi.fn());

        const link = screen.getByRole('link', { name: /compose email/i });
        const href = link.getAttribute('href') ?? '';

        expect(href).toMatch(/^mailto:beta@getunleash\.io\?/);
        expect(href).toContain(
            `subject=${encodeURIComponent('Input on Service Now integration')}`,
        );
        expect(href).toContain(
            `body=${encodeURIComponent("Hi Unleash team,\n\nI'd like to share some input on Service Now integration:\n\n")}`,
        );
    });

    it('tracks the compose-email click', async () => {
        const trackEvent = vi.fn();
        renderDialog(trackEvent);

        await userEvent.click(
            screen.getByRole('link', { name: /compose email/i }),
        );

        expect(trackEvent).toHaveBeenCalledWith('whats-new-page', {
            props: {
                eventType: 'share-input-compose-email-click',
                feature: 'Service Now integration',
            },
        });
    });

    it('links to the survey', () => {
        renderDialog(vi.fn());

        expect(
            screen.getByRole('link', { name: /fill out our survey/i }),
        ).toHaveAttribute('href', 'https://forms.gle/7tTX4LcyDY6DwYMDA');
    });

    it('tracks the survey click', async () => {
        const trackEvent = vi.fn();
        renderDialog(trackEvent);

        await userEvent.click(
            screen.getByRole('link', { name: /fill out our survey/i }),
        );

        expect(trackEvent).toHaveBeenCalledWith('whats-new-page', {
            props: {
                eventType: 'share-input-survey-click',
                feature: 'Service Now integration',
            },
        });
    });
});
