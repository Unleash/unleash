import { screen, fireEvent } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { describe, expect, test, vi } from 'vitest';
import { ToggleConstraintCaseSensitivity } from './ToggleConstraintCaseSensitivity';

describe('ToggleConstraintCaseSensitivity', () => {
    test('is pressed when caseInsensitive=false', () => {
        render(
            <ToggleConstraintCaseSensitivity
                caseInsensitive={false}
                onToggleCaseSensitivity={vi.fn()}
            />,
        );
        expect(
            screen.getByRole('button', { name: 'Case-sensitive' }),
        ).toHaveAttribute('aria-pressed', 'true');
    });

    test('is not pressed when caseInsensitive=true', () => {
        render(
            <ToggleConstraintCaseSensitivity
                caseInsensitive={true}
                onToggleCaseSensitivity={vi.fn()}
            />,
        );
        expect(
            screen.getByRole('button', { name: 'Case-sensitive' }),
        ).toHaveAttribute('aria-pressed', 'false');
    });

    test('calls onToggleCaseSensitivity when clicked', () => {
        const onToggleCaseSensitivity = vi.fn();
        render(
            <ToggleConstraintCaseSensitivity
                caseInsensitive={false}
                onToggleCaseSensitivity={onToggleCaseSensitivity}
            />,
        );

        fireEvent.click(screen.getByRole('button', { name: 'Case-sensitive' }));

        expect(onToggleCaseSensitivity).toHaveBeenCalledTimes(1);
    });

    test('shows a tooltip describing what the click will do', async () => {
        render(
            <ToggleConstraintCaseSensitivity
                caseInsensitive={false}
                onToggleCaseSensitivity={vi.fn()}
            />,
        );

        fireEvent.mouseOver(
            screen.getByRole('button', { name: 'Case-sensitive' }),
        );

        await screen.findByText('Make match not case sensitive');
    });
});
