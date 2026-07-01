import { describe, expect, it } from 'vitest';
import { render } from 'utils/testRenderer';
import { screen } from '@testing-library/react';
import { FeatureCard } from './FeatureCard.tsx';

describe('FeatureCard "Share your input" button', () => {
    it('opens a mailto with the feature title prefilled in subject and body', () => {
        render(
            <FeatureCard
                feature={{
                    phase: 'exploring',
                    title: 'Service Now integration',
                    description: 'desc',
                }}
            />,
        );

        const link = screen.getByRole('link', { name: /share your input/i });
        const href = link.getAttribute('href') ?? '';

        expect(href).toMatch(/^mailto:beta@getunleash\.io\?/);
        expect(href).toContain(
            `subject=${encodeURIComponent('Input on Service Now integration')}`,
        );
        expect(href).toContain(
            `body=${encodeURIComponent("Hi Unleash team,\n\nI'd like to share some input on Service Now integration:\n\n")}`,
        );
    });
});
