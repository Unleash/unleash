import { screen, fireEvent } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { describe, expect, test, vi } from 'vitest';
import {
    ConstrainInversionIcon,
    ToggleConstraintInverted,
} from './ToggleConstraintInverted';

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

    test('calls onToggleInverted when clicked', () => {
        const onToggleInverted = vi.fn();
        render(
            <ToggleConstraintInverted
                inverted={false}
                onToggleInverted={onToggleInverted}
            />,
        );
        fireEvent.click(
            screen.getByRole('button', {
                name: 'The constraint operator is inclusive.',
            }),
        );
        expect(onToggleInverted).toHaveBeenCalledOnce();
    });
});

describe('ConstrainInversionIcon', () => {
    test('renders without error when not inverted', () => {
        render(<ConstrainInversionIcon inverted={false} />);
        // Icon has aria-hidden so we verify the component renders by checking
        // the parent container contains at least one SVG
        expect(document.querySelector('svg')).toBeInTheDocument();
    });

    test('renders without error when inverted', () => {
        render(<ConstrainInversionIcon inverted={true} />);
        expect(document.querySelector('svg')).toBeInTheDocument();
    });
});
