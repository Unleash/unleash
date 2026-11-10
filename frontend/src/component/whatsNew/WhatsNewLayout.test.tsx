import { describe, expect, it, vi } from 'vitest';
import { render } from 'utils/testRenderer';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EventTrackerContext } from 'contexts/EventTrackerContext';
import { WhatsNewLayout } from './WhatsNewLayout.tsx';
import type { Feature } from './features.ts';

const released: Feature = {
    phase: 'released',
    title: 'Impact metrics',
    description: 'Track error rates and latency.',
    releasedAt: '2026-06-09',
    docsLink: 'https://docs.getunleash.io/impact-metrics',
};

const exploring: Feature = {
    phase: 'exploring',
    title: 'Time-travel rollbacks',
    description: 'Undo yesterdays deploy before it happened.',
};

describe('WhatsNewLayout', () => {
    it('renders a card for each released and in-progress feature', () => {
        render(<WhatsNewLayout features={[released, exploring]} />);

        expect(
            screen.getByRole('heading', { name: 'Impact metrics' }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('heading', { name: 'Time-travel rollbacks' }),
        ).toBeInTheDocument();
    });

    it('shows the in-progress empty state when no in-progress features are present', () => {
        render(<WhatsNewLayout features={[released]} />);

        expect(
            screen.getByText(/early access features will show up here/i),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole('heading', { name: 'Time-travel rollbacks' }),
        ).not.toBeInTheDocument();
    });

    it('reports engagement for every outbound link on the page', async () => {
        const trackEvent = vi.fn();

        render(
            <EventTrackerContext.Provider value={{ trackEvent }}>
                <WhatsNewLayout features={[released, exploring]} />
            </EventTrackerContext.Provider>,
        );

        await userEvent.click(
            screen.getByRole('link', { name: /read more in docs/i }),
        );
        expect(trackEvent).toHaveBeenCalledWith('whats-new-page', {
            props: {
                eventType: 'feature-docs-click',
                feature: 'Impact metrics',
            },
        });

        await userEvent.click(
            screen.getByRole('link', { name: /view all release notes/i }),
        );
        expect(trackEvent).toHaveBeenCalledWith('whats-new-page', {
            props: { eventType: 'release-notes-click' },
        });

        await userEvent.click(
            screen.getByRole('button', { name: /share your input/i }),
        );
        expect(trackEvent).toHaveBeenCalledWith('whats-new-page', {
            props: {
                eventType: 'share-input-dialog-open',
                feature: 'Time-travel rollbacks',
            },
        });
    });
});
