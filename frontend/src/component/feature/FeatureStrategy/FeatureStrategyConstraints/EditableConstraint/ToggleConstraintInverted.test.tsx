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

    test('is disabled with the provided text as aria-label when disabledText is set', () => {
        render(
            <ToggleConstraintInverted
                inverted={false}
                onToggleInverted={vi.fn()}
                disabledText='This operator does not support inversion'
            />,
        );
        const button = screen.getByRole('button', {
            name: 'This operator does not support inversion',
        });
        expect(button).toBeInTheDocument();
        expect(button).toBeDisabled();
    });
});
