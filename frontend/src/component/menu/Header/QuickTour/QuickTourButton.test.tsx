import { lazy, Suspense, useState } from 'react';
import { vi, expect, test } from 'vitest';
import { render } from 'utils/testRenderer';
import { screen, fireEvent } from '@testing-library/react';
import { QuickTourButton } from './QuickTourButton.tsx';

// Enable the gating flag and stub confetti (canvas isn't in jsdom).
vi.mock('hooks/useUiFlag.ts', () => ({ useUiFlag: () => true }));
vi.mock('react-confetti', () => ({ default: () => null }));

// Mirrors the button/dialog composition Header does - the button no longer
// owns the dialog, so tests wire them together the same way Header does.
const QuickTourDialog = lazy(() =>
    import('./QuickTourDialog.tsx').then((m) => ({
        default: m.QuickTourDialog,
    })),
);

const Harness = () => {
    const [open, setOpen] = useState(false);
    return (
        <>
            <QuickTourButton onOpen={() => setOpen(true)} />
            {open && (
                <Suspense fallback={null}>
                    <QuickTourDialog onClose={() => setOpen(false)} />
                </Suspense>
            )}
        </>
    );
};

test('shows the launcher and opens the quick tour on click', async () => {
    render(<Harness />);

    const button = screen.getByTestId('QUICK_TOUR_BUTTON');
    expect(button).toBeInTheDocument();

    fireEvent.click(button);

    // The tour (lazy-loaded) mounts and shows its first step.
    expect(
        await screen.findByText('Flip a feature on and off'),
    ).toBeInTheDocument();
});
