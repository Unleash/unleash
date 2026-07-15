import { vi, expect, test } from 'vitest';
import { render } from 'utils/testRenderer';
import { screen, fireEvent, act, within } from '@testing-library/react';
import { QuickTourDemo } from './QuickTourDemo.tsx';

// react-confetti renders to a canvas, which jsdom doesn't implement.
vi.mock('react-confetti', () => ({ default: () => null }));

const next = () =>
    fireEvent.click(screen.getByTestId('QUICK_TOUR_DEMO_NEXT_BUTTON'));

test('renders the first (on/off) topic and a live user count', () => {
    render(<QuickTourDemo onComplete={vi.fn()} />);
    expect(screen.getByText('Flip a feature on and off')).toBeInTheDocument();
    expect(screen.getByText(/users see the feature/)).toBeInTheDocument();
    expect(
        screen.getByTestId('QUICK_TOUR_DEMO_ONOFF_SWITCH'),
    ).toBeInTheDocument();
});

test('walks through all four topics to the finish screen', () => {
    render(<QuickTourDemo onComplete={vi.fn()} />);

    next();
    expect(screen.getByText('Release gradually, safely')).toBeInTheDocument();

    next();
    expect(screen.getByText('Target exactly who you want')).toBeInTheDocument();

    next();
    expect(screen.getByText('Run an A/B test')).toBeInTheDocument();

    next();
    expect(
        screen.getByTestId('QUICK_TOUR_DEMO_FINISH_BUTTON'),
    ).toBeInTheDocument();
});

test('calls onComplete when finishing', () => {
    const onComplete = vi.fn();
    render(<QuickTourDemo onComplete={onComplete} />);

    next(); // -> rollout
    next(); // -> target
    next(); // -> variants
    next(); // -> finish screen
    fireEvent.click(screen.getByTestId('QUICK_TOUR_DEMO_FINISH_BUTTON'));

    expect(onComplete).toHaveBeenCalledTimes(1);
});

test('plays the kill-switch story in the first step', () => {
    vi.useFakeTimers();
    render(<QuickTourDemo onComplete={vi.fn()} />);

    const toggle = screen.getByRole('switch', {
        name: 'Toggle the feature in production',
    });
    fireEvent.click(toggle);
    act(() => {
        vi.advanceTimersByTime(2000);
    });
    expect(screen.getByTestId('QUICK_TOUR_DEMO_BUG_ALERT')).toBeInTheDocument();

    fireEvent.click(toggle);
    expect(
        screen.getByTestId('QUICK_TOUR_DEMO_BUG_RESOLVED'),
    ).toBeInTheDocument();
    vi.useRealTimers();
});

test('manages variants and shows a user payload in the variants step', () => {
    render(<QuickTourDemo onComplete={vi.fn()} />);

    next(); // -> rollout
    next(); // -> target
    next(); // -> variants

    // The even split is recalculated when a variant is added.
    fireEvent.click(screen.getByTestId('QUICK_TOUR_DEMO_ADD_VARIANT_BUTTON'));
    // 'C' appears in the variant list, the split preview, and on shirts.
    expect(screen.getAllByText('C').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('33%').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('34%').length).toBeGreaterThanOrEqual(1);

    // Clicking a user reveals the exact payload their app would receive.
    const grid = screen.getByTestId('QUICK_TOUR_DEMO_USER_GRID');
    fireEvent.click(within(grid).getAllByRole('button')[0]);
    expect(screen.getByTestId('QUICK_TOUR_DEMO_PAYLOAD')).toHaveTextContent(
        /cta/,
    );
});

test('calls onComplete when skipping', () => {
    const onComplete = vi.fn();
    render(<QuickTourDemo onComplete={onComplete} />);

    fireEvent.click(screen.getByRole('button', { name: 'Skip' }));
    expect(onComplete).toHaveBeenCalledTimes(1);
});
