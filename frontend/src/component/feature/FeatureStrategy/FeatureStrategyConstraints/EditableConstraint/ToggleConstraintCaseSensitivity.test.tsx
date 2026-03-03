import { screen } from '@testing-library/react';
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
});
