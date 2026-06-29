import { test, vi, expect } from 'vitest';
import { render } from 'utils/testRenderer';
import { screen, fireEvent } from '@testing-library/react';
import { OnboardingProgress } from './OnboardingProgress.tsx';

const renderProgress = (step: number, maxSteps = 3, onDismiss = vi.fn()) =>
    render(
        <OnboardingProgress
            step={step}
            maxSteps={maxSteps}
            onDismiss={onDismiss}
        />,
    );

test('shows step count', () => {
    renderProgress(1);
    expect(screen.getByText('1/3 Completed')).toBeInTheDocument();
});

test('shows progress bar when not yet onboarded', () => {
    renderProgress(1);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Dismiss' })).toBeNull();
});

test('shows dismiss button when onboarded', () => {
    renderProgress(3);
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).toBeNull();
});

test('calls onDismiss when dismiss button is clicked', () => {
    const onDismiss = vi.fn();
    renderProgress(3, 3, onDismiss);
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
});
