import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'utils/testRenderer';
import { FlagImpactDialog } from './FlagImpactDialog';
import type { FlagEventImpact } from './computeFlagEventImpact';
import type { MultimetricFeatureEvent } from 'component/impact-metrics/MultimetricChart/types';

const HOUR_MS = 60 * 60 * 1000;
const HOUR_SEC = 60 * 60;

const makeEvent = (
    overrides: Partial<MultimetricFeatureEvent> & {
        id: number;
        featureName: string;
    },
): MultimetricFeatureEvent => ({
    timestamp: Date.UTC(2026, 4, 15, 12),
    type: 'feature-environment-enabled',
    label: 'Enabled',
    createdBy: 'alice@example.com',
    ...overrides,
});

const makeImpact = (
    overrides: Partial<FlagEventImpact> & {
        eventId: number;
        event: MultimetricFeatureEvent;
    },
): FlagEventImpact => ({
    halfWindowMs: HOUR_MS,
    requestedHalfWindowMs: HOUR_MS,
    clampReason: null,
    preValue: 100,
    postValue: 185,
    deltaAbs: 85,
    deltaPct: 85,
    preSeries: [
        [overrides.event.timestamp / 1000 - HOUR_SEC, 95],
        [overrides.event.timestamp / 1000 - HOUR_SEC / 2, 105],
    ],
    postSeries: [
        [overrides.event.timestamp / 1000 + HOUR_SEC / 2, 180],
        [overrides.event.timestamp / 1000 + HOUR_SEC, 190],
    ],
    ...overrides,
});

describe('FlagImpactDialog', () => {
    it('renders nothing visible when impact is null', () => {
        render(
            <FlagImpactDialog
                impact={null}
                aggregationMode='avg'
                onClose={vi.fn()}
            />,
        );
        // No dialog content should be in the DOM when impact is null.
        expect(screen.queryByText(/Goal change/i)).not.toBeInTheDocument();
    });

    it('shows BEFORE, AFTER, Δ, and the flag name when opened', () => {
        const impact = makeImpact({
            eventId: 1,
            event: makeEvent({ id: 1, featureName: 'new-checkout-flow' }),
        });
        render(
            <FlagImpactDialog
                impact={impact}
                aggregationMode='avg'
                onClose={vi.fn()}
            />,
        );
        expect(screen.getByText('new-checkout-flow')).toBeInTheDocument();
        expect(screen.getByText('Before')).toBeInTheDocument();
        expect(screen.getByText('After')).toBeInTheDocument();
        expect(screen.getByText('100')).toBeInTheDocument();
        expect(screen.getByText('185')).toBeInTheDocument();
        expect(screen.getByText(/\+85%/)).toBeInTheDocument();
    });

    it('uses "Average of the goal" copy for latest-mode aggregations', () => {
        render(
            <FlagImpactDialog
                impact={makeImpact({
                    eventId: 1,
                    event: makeEvent({ id: 1, featureName: 'flag-a' }),
                })}
                aggregationMode='avg'
                onClose={vi.fn()}
            />,
        );
        expect(
            screen.getAllByText(/Average of the goal/).length,
        ).toBeGreaterThan(0);
    });

    it('uses "Sum of the goal" copy for cumulative aggregations', () => {
        render(
            <FlagImpactDialog
                impact={makeImpact({
                    eventId: 1,
                    event: makeEvent({ id: 1, featureName: 'flag-a' }),
                })}
                aggregationMode='count'
                onClose={vi.fn()}
            />,
        );
        expect(screen.getAllByText(/Sum of the goal/).length).toBeGreaterThan(
            0,
        );
    });

    it('renders em-dash and explanatory footnote when one side is missing', () => {
        const impact = makeImpact({
            eventId: 1,
            event: makeEvent({ id: 1, featureName: 'edge-flag' }),
            preValue: null,
            deltaAbs: null,
            deltaPct: null,
            preSeries: [],
        });
        render(
            <FlagImpactDialog
                impact={impact}
                aggregationMode='avg'
                onClose={vi.fn()}
            />,
        );
        // At least one em-dash should be present (the missing-side BEFORE
        // value); the Δ row may render one too when deltaAbs is null.
        expect(screen.getAllByText('\u2014').length).toBeGreaterThan(0);
        expect(
            screen.getByText(/Not enough data on one side of the flip/),
        ).toBeInTheDocument();
    });

    it('fires onClose when the close button is clicked', async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();
        render(
            <FlagImpactDialog
                impact={makeImpact({
                    eventId: 1,
                    event: makeEvent({ id: 1, featureName: 'flag-a' }),
                })}
                aggregationMode='avg'
                onClose={onClose}
            />,
        );
        await user.click(screen.getByLabelText(/close/i));
        expect(onClose).toHaveBeenCalled();
    });
});
