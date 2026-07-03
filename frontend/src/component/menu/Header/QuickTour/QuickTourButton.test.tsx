import { vi, expect, test } from 'vitest';
import { render } from 'utils/testRenderer';
import { screen, fireEvent } from '@testing-library/react';
import { QuickTourButton } from './QuickTourButton.tsx';

// Enable the gating flag and stub confetti (canvas isn't in jsdom).
vi.mock('hooks/useUiFlag.ts', () => ({ useUiFlag: () => true }));
vi.mock('react-confetti', () => ({ default: () => null }));

test('shows the launcher and opens the quick tour on click', async () => {
    render(<QuickTourButton />);

    const button = screen.getByTestId('QUICK_TOUR_BUTTON');
    expect(button).toBeInTheDocument();

    fireEvent.click(button);

    // The tour (lazy-loaded) mounts and shows its first step.
    expect(
        await screen.findByText('Flip a feature on and off'),
    ).toBeInTheDocument();
});
