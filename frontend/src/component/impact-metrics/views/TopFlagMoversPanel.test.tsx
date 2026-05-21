import { describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'utils/testRenderer';
import { TopFlagMoversPanel } from './TopFlagMoversPanel';
import type { FlagEventImpact } from './computeFlagEventImpact';
import type { MultimetricFeatureEvent } from 'component/impact-metrics/MultimetricChart/types';

const makeEvent = (
    overrides: Partial<MultimetricFeatureEvent> & {
        id: number;
        featureName: string;
    },
): MultimetricFeatureEvent => ({
    timestamp: Date.now() - 60 * 60 * 1000,
    type: 'feature-environment-enabled',
    label: 'Enabled',
    createdBy: 'alice',
    ...overrides,
});

const makeImpact = (
    overrides: Partial<FlagEventImpact> & {
        eventId: number;
        event: MultimetricFeatureEvent;
    },
): FlagEventImpact => ({
    halfWindowMs: 60 * 60 * 1000,
    requestedHalfWindowMs: 60 * 60 * 1000,
    clampReason: null,
    preValue: 10,
    postValue: 20,
    deltaAbs: 10,
    deltaPct: 100,
    preSeries: [],
    postSeries: [],
    ...overrides,
});

describe('TopFlagMoversPanel', () => {
    it('renders the "No flag changes" empty state when impacts list is empty', () => {
        render(
            <TopFlagMoversPanel
                impacts={[]}
                highlightedEventId={null}
                onHighlightedEventChange={vi.fn()}
                baselineId='1h'
                onBaselineChange={vi.fn()}
            />,
        );
        expect(
            screen.getByText(/No flag changes in this window/),
        ).toBeInTheDocument();
    });

    it('renders the "no movement" message when all impacts are below threshold', () => {
        render(
            <TopFlagMoversPanel
                impacts={[
                    makeImpact({
                        eventId: 1,
                        event: makeEvent({ id: 1, featureName: 'tiny' }),
                        deltaPct: 0.3,
                        deltaAbs: 0.3,
                    }),
                ]}
                highlightedEventId={null}
                onHighlightedEventChange={vi.fn()}
                baselineId='1h'
                onBaselineChange={vi.fn()}
            />,
        );
        expect(
            screen.getByText(/No flag flips moved the goal/),
        ).toBeInTheDocument();
    });

    it('renders measurable movers in order with sign and percent', () => {
        const impacts = [
            makeImpact({
                eventId: 1,
                event: makeEvent({ id: 1, featureName: 'flag-a' }),
                deltaPct: 200,
                deltaAbs: 200,
            }),
            makeImpact({
                eventId: 2,
                event: makeEvent({ id: 2, featureName: 'flag-b' }),
                deltaPct: -50,
                deltaAbs: -50,
                postValue: 5,
            }),
        ];
        render(
            <TopFlagMoversPanel
                impacts={impacts}
                highlightedEventId={null}
                onHighlightedEventChange={vi.fn()}
                baselineId='1h'
                onBaselineChange={vi.fn()}
            />,
        );
        const rows = screen.getAllByRole('button', {
            name: /flag-/,
        });
        expect(rows[0]).toHaveTextContent('flag-a');
        expect(rows[0]).toHaveTextContent(/\+200%/);
        expect(rows[1]).toHaveTextContent('flag-b');
        expect(rows[1]).toHaveTextContent(/\u221250%/);
    });

    it('caps at four rows and shows "+N more"', () => {
        const impacts = Array.from({ length: 8 }, (_, idx) =>
            makeImpact({
                eventId: idx + 1,
                event: makeEvent({
                    id: idx + 1,
                    featureName: `flag-${idx + 1}`,
                }),
                deltaPct: 50 - idx,
            }),
        );
        render(
            <TopFlagMoversPanel
                impacts={impacts}
                highlightedEventId={null}
                onHighlightedEventChange={vi.fn()}
                baselineId='1h'
                onBaselineChange={vi.fn()}
            />,
        );
        expect(screen.getByText('flag-4')).toBeInTheDocument();
        expect(screen.queryByText('flag-5')).not.toBeInTheDocument();
        expect(screen.getByText(/\+4 more/)).toBeInTheDocument();
    });

    it('calls onOpenedEventChange when a row is clicked', async () => {
        const user = userEvent.setup();
        const onOpenedEventChange = vi.fn();
        render(
            <TopFlagMoversPanel
                impacts={[
                    makeImpact({
                        eventId: 42,
                        event: makeEvent({ id: 42, featureName: 'flag-a' }),
                    }),
                ]}
                highlightedEventId={null}
                onHighlightedEventChange={vi.fn()}
                baselineId='1h'
                onBaselineChange={vi.fn()}
                onOpenedEventChange={onOpenedEventChange}
            />,
        );
        await user.click(screen.getByRole('button', { name: /flag-a/ }));
        expect(onOpenedEventChange).toHaveBeenCalledWith(42);
    });

    it('emits onBaselineChange when picking a different baseline', async () => {
        const user = userEvent.setup();
        const onBaselineChange = vi.fn();
        render(
            <TopFlagMoversPanel
                impacts={[]}
                highlightedEventId={null}
                onHighlightedEventChange={vi.fn()}
                baselineId='1h'
                onBaselineChange={onBaselineChange}
            />,
        );
        await user.click(screen.getByRole('combobox'));
        const listbox = await screen.findByRole('listbox');
        await user.click(within(listbox).getByText('±6 hours'));
        expect(onBaselineChange).toHaveBeenCalledWith('6h');
    });
});
