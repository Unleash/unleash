import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useReminders } from './useReminders.ts';

const TestComponent = ({
    days = 7,
    maxReminders = 50,
}: {
    days?: number;
    maxReminders?: number;
}) => {
    const { shouldShowReminder, snoozeReminder } = useReminders({
        days,
        maxReminders,
    });

    return (
        <div>
            <button type='button' onClick={() => snoozeReminder('test-flag')}>
                Snooze
            </button>
            <button
                type='button'
                onClick={() => snoozeReminder('test-flag-another')}
            >
                Snooze Another
            </button>
            <div data-testid='result'>
                {shouldShowReminder('test-flag') ? 'yes' : 'no'}
            </div>
        </div>
    );
};

describe('useFlagReminders (integration)', () => {
    beforeEach(() => {
        window.localStorage.clear();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should show reminder when no snooze exists', () => {
        render(<TestComponent />);

        expect(screen.getByTestId('result').textContent).toBe('yes');
    });

    it('should not show reminder after snoozing', () => {
        render(<TestComponent />);
        fireEvent.click(screen.getByText('Snooze'));

        expect(screen.getByTestId('result').textContent).toBe('no');
    });

    it('should show reminder again after snooze expires', () => {
        const { rerender } = render(<TestComponent days={3} />);
        fireEvent.click(screen.getByText('Snooze'));

        // Advance 4 days
        vi.advanceTimersByTime(4 * 24 * 60 * 60 * 1000);
        rerender(<TestComponent days={3} />);

        expect(screen.getByTestId('result').textContent).toBe('yes');
    });

    it('should respect max reminders and remove oldest entries', () => {
        render(<TestComponent maxReminders={1} />);
        fireEvent.click(screen.getByText('Snooze'));
        fireEvent.click(screen.getByText('Snooze Another'));

        expect(screen.getByTestId('result').textContent).toBe('yes');
    });
});
