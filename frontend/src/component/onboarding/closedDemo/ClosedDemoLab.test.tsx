import { vi, expect, test } from 'vitest';
import { render } from 'utils/testRenderer';
import { screen, fireEvent } from '@testing-library/react';
import { ClosedDemoLab } from './ClosedDemoLab.tsx';

// react-confetti renders to a canvas, which jsdom doesn't implement.
vi.mock('react-confetti', () => ({ default: () => null }));

const FRAMING_LABELS = [
    '1 · Full page',
    '2 · Dialog over app',
    '3 · Side drawer',
    '4 · Inline on project',
    '5 · Welcome splash',
];

test('mounts every framing without crashing when switching', () => {
    render(<ClosedDemoLab />);

    for (const label of FRAMING_LABELS) {
        fireEvent.click(screen.getByRole('button', { name: label }));
        // Every framing hosts the grid demo, so its first topic must render.
        expect(
            screen.getAllByText('Flip a feature on and off').length,
        ).toBeGreaterThan(0);
    }
});
