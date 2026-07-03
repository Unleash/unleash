import { vi, expect, test } from 'vitest';
import { render } from 'utils/testRenderer';
import { screen, fireEvent } from '@testing-library/react';
import { ClosedDemo } from './ClosedDemo.tsx';

// react-confetti renders to a canvas, which jsdom doesn't implement.
vi.mock('react-confetti', () => ({ default: () => null }));

const next = () =>
    fireEvent.click(screen.getByTestId('CLOSED_DEMO_NEXT_BUTTON'));

test('renders the first (on/off) topic and a live user count', () => {
    render(<ClosedDemo onComplete={vi.fn()} />);
    expect(screen.getByText('Flip a feature on and off')).toBeInTheDocument();
    expect(screen.getByText(/users see the feature/)).toBeInTheDocument();
    expect(screen.getByTestId('CLOSED_DEMO_ONOFF_SWITCH')).toBeInTheDocument();
});

test('walks through all four topics to the finish screen', () => {
    render(<ClosedDemo onComplete={vi.fn()} />);

    next();
    expect(screen.getByText('Release gradually, safely')).toBeInTheDocument();

    next();
    expect(screen.getByText('Target exactly who you want')).toBeInTheDocument();

    next();
    expect(screen.getByText('Run an A/B test')).toBeInTheDocument();

    next();
    expect(screen.getByTestId('CLOSED_DEMO_FINISH_BUTTON')).toBeInTheDocument();
});

test('calls onComplete when finishing', () => {
    const onComplete = vi.fn();
    render(<ClosedDemo onComplete={onComplete} />);

    next(); // -> rollout
    next(); // -> target
    next(); // -> variants
    next(); // -> finish screen
    fireEvent.click(screen.getByTestId('CLOSED_DEMO_FINISH_BUTTON'));

    expect(onComplete).toHaveBeenCalledTimes(1);
});

test('calls onComplete when skipping', () => {
    const onComplete = vi.fn();
    render(<ClosedDemo onComplete={onComplete} />);

    fireEvent.click(screen.getByRole('button', { name: 'Skip' }));
    expect(onComplete).toHaveBeenCalledTimes(1);
});
