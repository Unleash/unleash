import { screen, fireEvent } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { describe, expect, test, vi } from 'vitest';
import { ToggleConstraintCaseSensitivity } from './ToggleConstraintCaseSensitivity';

describe('ToggleConstraintCaseSensitivity', () => {
    test('shows case-sensitive aria-label when caseInsensitive=false', () => {
        render(
            <ToggleConstraintCaseSensitivity
                caseInsensitive={false}
                onToggleCaseSensitivity={vi.fn()}
            />,
        );
        expect(
            screen.getByRole('button', {
                name: 'The match is case sensitive.',
            }),
        ).toBeInTheDocument();
    });

    test('shows case-insensitive aria-label when caseInsensitive=true', () => {
        render(
            <ToggleConstraintCaseSensitivity
                caseInsensitive={true}
                onToggleCaseSensitivity={vi.fn()}
            />,
        );
        expect(
            screen.getByRole('button', {
                name: 'The match is not case sensitive.',
            }),
        ).toBeInTheDocument();
    });

    test('calls onToggleCaseSensitivity when clicked', () => {
        const onToggleCaseSensitivity = vi.fn();
        render(
            <ToggleConstraintCaseSensitivity
                caseInsensitive={false}
                onToggleCaseSensitivity={onToggleCaseSensitivity}
            />,
        );
        fireEvent.click(
            screen.getByRole('button', {
                name: 'The match is case sensitive.',
            }),
        );
        expect(onToggleCaseSensitivity).toHaveBeenCalledOnce();
    });

    test('calls onToggleCaseSensitivity when clicked in case-insensitive state', () => {
        const onToggleCaseSensitivity = vi.fn();
        render(
            <ToggleConstraintCaseSensitivity
                caseInsensitive={true}
                onToggleCaseSensitivity={onToggleCaseSensitivity}
            />,
        );
        fireEvent.click(
            screen.getByRole('button', {
                name: 'The match is not case sensitive.',
            }),
        );
        expect(onToggleCaseSensitivity).toHaveBeenCalledOnce();
    });
});
