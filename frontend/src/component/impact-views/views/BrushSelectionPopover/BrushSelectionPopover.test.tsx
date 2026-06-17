import { fireEvent, render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material';
import { describe, expect, it, vi } from 'vitest';
import theme from 'themes/theme';
import type { FlagImpact } from '../computeFlagImpacts';
import type { WindowSummary } from '../computeWindowSummary';
import { BrushSelectionPopover } from './BrushSelectionPopover';

const selection = {
    fromMs: new Date('2026-06-17T09:00:00Z').getTime(),
    toMs: new Date('2026-06-17T11:00:00Z').getTime(),
};

const summary: WindowSummary = {
    goalSummary: {
        current: 168,
        mode: 'latest',
        deltaAbs: 48,
        deltaPct: 40,
    },
    windowedSeries: {
        label: 'goal',
        data: [
            [0, 120],
            [3600, 168],
        ],
    },
};

const impact = (overrides: Partial<FlagImpact> = {}): FlagImpact => ({
    featureName: 'pricing-experiment',
    deltaPct: 18,
    tone: 'up',
    detail: {
        event: {
            id: 1,
            timestamp: new Date('2026-06-17T10:00:00Z').getTime(),
            type: 'feature-environment-enabled',
            label: 'Enabled',
            createdBy: 'alice@example.com',
            featureName: 'pricing-experiment',
            environment: 'production',
        },
        halfWindowMs: 3 * 60 * 60 * 1000,
        before: 100,
        after: 118,
        deltaAbs: 18,
        preSeries: [[0, 100]],
        postSeries: [[1, 118]],
    },
    ...overrides,
});

const renderPopover = (
    props: Partial<React.ComponentProps<typeof BrushSelectionPopover>> = {},
) =>
    render(
        <ThemeProvider theme={theme}>
            <BrushSelectionPopover
                anchorEl={document.body}
                open
                selection={selection}
                summary={summary}
                impacts={[impact()]}
                onClear={() => {}}
                {...props}
            />
        </ThemeProvider>,
    );

describe('BrushSelectionPopover', () => {
    it('shows the goal delta and trend across the window', () => {
        renderPopover();
        expect(screen.getByText('+40%')).toBeInTheDocument();
        expect(
            screen.getByLabelText('Goal trend in selected window'),
        ).toBeInTheDocument();
    });

    it('lists each flag change with its per-flip goal delta', () => {
        renderPopover();
        expect(screen.getByText('pricing-experiment')).toBeInTheDocument();
        expect(screen.getByText(/Enabled/)).toBeInTheDocument();
        // window goal delta (+40%) and the per-flip delta (+18%) both show
        expect(screen.getByText('+18%')).toBeInTheDocument();
    });

    it('calls onHoverFlip with the flip timestamp on row hover', () => {
        const onHoverFlip = vi.fn();
        renderPopover({ onHoverFlip });
        fireEvent.mouseOver(screen.getByText('pricing-experiment'));
        expect(onHoverFlip).toHaveBeenCalledWith(
            impact().detail.event.timestamp,
        );
    });

    it('shows an empty state with no measurable flips', () => {
        renderPopover({ impacts: [] });
        expect(
            screen.getByText('No measurable flag changes in this window.'),
        ).toBeInTheDocument();
    });

    it('does not render when closed', () => {
        renderPopover({ open: false });
        expect(screen.queryByText('+40%')).not.toBeInTheDocument();
    });

    it('calls onClear from the clear button', () => {
        const onClear = vi.fn();
        renderPopover({ onClear });
        screen.getByRole('button', { name: 'Clear selection' }).click();
        expect(onClear).toHaveBeenCalled();
    });
});
