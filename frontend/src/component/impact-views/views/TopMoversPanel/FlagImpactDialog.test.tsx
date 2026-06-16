import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material';
import { describe, expect, it, vi } from 'vitest';
import theme from 'themes/theme';
import type { FlagImpact } from '../computeFlagImpacts';
import { FlagImpactDialog } from './FlagImpactDialog';

const impact: FlagImpact = {
    featureName: 'checkout-redesign',
    deltaPct: 100,
    tone: 'up',
    detail: {
        event: {
            id: 1,
            timestamp: 10 * 24 * 60 * 60 * 1000,
            type: 'feature-environment-enabled',
            label: 'Enabled',
            createdBy: 'alice@example.com',
            featureName: 'checkout-redesign',
            environment: 'production',
        },
        halfWindowMs: 3 * 60 * 60 * 1000,
        before: 10,
        after: 20,
        deltaAbs: 10,
        preSeries: [[0, 10]],
        postSeries: [[1, 20]],
    },
};

const renderDialog = (
    props: Partial<React.ComponentProps<typeof FlagImpactDialog>> = {},
) =>
    render(
        <ThemeProvider theme={theme}>
            <FlagImpactDialog
                impact={impact}
                aggregationMode='avg'
                onClose={() => {}}
                {...props}
            />
        </ThemeProvider>,
    );

describe('FlagImpactDialog', () => {
    it('shows the flag, before/after values and Δ% when open', () => {
        renderDialog();

        expect(screen.getByText('checkout-redesign')).toBeInTheDocument();
        expect(screen.getByText('Before')).toBeInTheDocument();
        expect(screen.getByText('After')).toBeInTheDocument();
        expect(screen.getByText('10')).toBeInTheDocument();
        expect(screen.getByText('20')).toBeInTheDocument();
        expect(screen.getByText('+100%')).toBeInTheDocument();
        expect(screen.getByText(/by alice@example.com/)).toBeInTheDocument();
    });

    it('renders nothing visible when no impact is selected', () => {
        renderDialog({ impact: null });

        expect(screen.queryByText('checkout-redesign')).not.toBeInTheDocument();
        expect(screen.queryByText('Before')).not.toBeInTheDocument();
    });

    it('calls onClose from the close button', async () => {
        const onClose = vi.fn();
        renderDialog({ onClose });

        screen.getByRole('button', { name: 'Close' }).click();

        expect(onClose).toHaveBeenCalled();
    });
});
