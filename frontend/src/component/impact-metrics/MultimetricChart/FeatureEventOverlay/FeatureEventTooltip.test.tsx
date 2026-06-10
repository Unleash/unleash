import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { render } from 'utils/testRenderer';
import type { MultimetricFeatureEvent } from '../types';
import { FeatureEventTooltip } from './FeatureEventTooltip';

const event = (
    overrides: Partial<MultimetricFeatureEvent> = {},
): MultimetricFeatureEvent => ({
    id: 1,
    timestamp: new Date('2026-06-01T12:00:00Z').getTime(),
    type: 'feature-environment-enabled',
    label: 'feature-environment-enabled',
    createdBy: 'admin',
    featureName: 'my-flag',
    environment: 'production',
    ...overrides,
});

describe('FeatureEventTooltip', () => {
    it('shows the feature name, event type, and author for each event', () => {
        render(
            <FeatureEventTooltip
                group={{
                    pct: 50,
                    events: [
                        event({ id: 1, featureName: 'first-flag' }),
                        event({
                            id: 2,
                            featureName: 'second-flag',
                            type: 'feature-environment-disabled',
                            createdBy: 'other-user',
                            environment: 'development',
                        }),
                    ],
                }}
            />,
        );

        expect(screen.getByText('first-flag')).toBeInTheDocument();
        expect(screen.getByText('second-flag')).toBeInTheDocument();
        expect(screen.getByText(/Enabled/)).toBeInTheDocument();
        expect(screen.getByText(/Disabled/)).toBeInTheDocument();
        expect(screen.getByText('admin')).toBeInTheDocument();
        expect(screen.getByText('other-user')).toBeInTheDocument();
    });

    it('shows the event environment in the grouped header', () => {
        render(
            <FeatureEventTooltip
                group={{
                    pct: 50,
                    events: [
                        event({ id: 1, environment: 'development' }),
                        event({ id: 2, environment: 'development' }),
                    ],
                }}
            />,
        );

        expect(screen.getByText('2 events in development')).toBeInTheDocument();
    });

    it('shows the capitalized environment for a single event', () => {
        render(
            <FeatureEventTooltip
                group={{
                    pct: 50,
                    events: [event({ environment: 'development' })],
                }}
            />,
        );

        expect(screen.getByText('Development')).toBeInTheDocument();
    });

    it('falls back to the event type label when the feature name is empty', () => {
        render(
            <FeatureEventTooltip
                group={{ pct: 50, events: [event({ featureName: '' })] }}
            />,
        );

        expect(screen.getByText('Enabled')).toBeInTheDocument();
    });
});
