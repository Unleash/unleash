import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { describe, expect, test, vi } from 'vitest';
import { ToggleConstraintInverted } from './ToggleConstraintInverted';

describe('ToggleConstraintInverted', () => {
    test('shows inclusive aria-label when not inverted', () => {
        render(
            <ToggleConstraintInverted
                inverted={false}
                onToggleInverted={vi.fn()}
            />,
        );
        expect(
            screen.getByRole('button', {
                name: 'The constraint operator is inclusive.',
            }),
        ).toBeInTheDocument();
    });

    test('shows exclusive aria-label when inverted', () => {
        render(
            <ToggleConstraintInverted
                inverted={true}
                onToggleInverted={vi.fn()}
            />,
        );
        expect(
            screen.getByRole('button', {
                name: 'The constraint operator is exclusive.',
            }),
        ).toBeInTheDocument();
    });

    test('defaults to inclusive behavior when inverted is undefined', () => {
        render(<ToggleConstraintInverted onToggleInverted={vi.fn()} />);
        expect(
            screen.getByRole('button', {
                name: 'The constraint operator is inclusive.',
            }),
        ).toBeInTheDocument();
    });
});
