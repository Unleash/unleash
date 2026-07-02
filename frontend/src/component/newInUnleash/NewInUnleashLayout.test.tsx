import { describe, expect, it } from 'vitest';
import { render } from 'utils/testRenderer';
import { screen } from '@testing-library/react';
import { NewInUnleashLayout } from './NewInUnleashLayout.tsx';
import type { Feature } from './features.ts';

const released: Feature = {
    phase: 'released',
    title: 'Impact metrics',
    description: 'Track error rates and latency.',
    releasedAt: '2026-06-09',
};

const exploring: Feature = {
    phase: 'exploring',
    title: 'Time-travel rollbacks',
    description: 'Undo yesterdays deploy before it happened.',
};

describe('NewInUnleashLayout', () => {
    it('renders a card for each released and in-progress feature', () => {
        render(<NewInUnleashLayout features={[released, exploring]} />);

        expect(
            screen.getByRole('heading', { name: 'Impact metrics' }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('heading', { name: 'Time-travel rollbacks' }),
        ).toBeInTheDocument();
    });

    it('shows the in-progress empty state when no in-progress features are present', () => {
        render(<NewInUnleashLayout features={[released]} />);

        expect(
            screen.getByText(/early access features will show up here/i),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole('heading', { name: 'Time-travel rollbacks' }),
        ).not.toBeInTheDocument();
    });
});
