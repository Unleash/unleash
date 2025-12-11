import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TimeAgo } from './TimeAgo.tsx';
import { act } from 'react';

const h = 3_600_000 as const;
const min = 60_000 as const;
const s = 1_000 as const;

beforeAll(() => {
    vi.useFakeTimers();
});

afterAll(() => {
    vi.useRealTimers();
});

test('renders fallback when date is null or undefined', () => {
    render(<TimeAgo date={null} fallback='N/A' />);
    expect(screen.getByText('N/A')).toBeInTheDocument();

    render(<TimeAgo date={undefined} fallback='unknown' />);
    expect(screen.getByText('unknown')).toBeInTheDocument();
});

test('formats date correctly', () => {
    const date = new Date();
    render(<TimeAgo date={date} />);
    expect(screen.getByText('< 1 minute ago')).toBeInTheDocument();
});

test('updates time periodically', () => {
    const date = new Date();
    render(<TimeAgo date={date} />);

    expect(screen.getByText('< 1 minute ago')).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(61 * s));

    expect(screen.getByText('1 minute ago')).toBeInTheDocument();
});

test('stops updating when live is false', () => {
    const date = new Date();
    const setIntervalSpy = vi.spyOn(global, 'setInterval');
    render(<TimeAgo date={date} refresh={false} />);

    expect(screen.getByText('< 1 minute ago')).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(61 * s));

    expect(screen.getByText('< 1 minute ago')).toBeInTheDocument();

    expect(setIntervalSpy).not.toHaveBeenCalled();
});

test('handles string dates', () => {
    const dateString = '2024-01-01T00:00:00Z';
    vi.setSystemTime(new Date('2024-01-01T01:01:00Z'));

    render(<TimeAgo date={dateString} />);
    expect(screen.getByText('1 hour ago')).toBeInTheDocument();
});

test('cleans up interval on unmount', () => {
    const date = new Date();
    const { unmount } = render(<TimeAgo date={date} refresh />);

    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
    unmount();
    expect(clearIntervalSpy).toHaveBeenCalled();
});

test('renders fallback for invalid date', () => {
    render(<TimeAgo date='invalid-date' fallback='Invalid date' />);
    expect(screen.getByText('Invalid date')).toBeInTheDocument();
});

test('on date change, current time should be updated', () => {
    const start = Date.now();

    vi.advanceTimersByTime(60_000);

    const Component = ({ date }: { date: number }) => (
        <>
            <TimeAgo date={date} />
        </>
    );

    const { rerender } = render(<Component date={start} />);
    expect(screen.getByText('1 minute ago')).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(2 * min));
    rerender(<Component date={start} />);

    expect(screen.getByText('3 minutes ago')).toBeInTheDocument();

    rerender(<Component date={start + min} />);

    expect(screen.getByText('2 minutes ago')).toBeInTheDocument();
});

test('should refresh on fallback change', () => {
    const date = null;
    const { rerender } = render(
        <TimeAgo date={date} fallback='Initial fallback' />,
    );
    expect(screen.getByText('Initial fallback')).toBeInTheDocument();

    rerender(<TimeAgo date={date} fallback='Updated fallback' />);
    expect(screen.getByText('Updated fallback')).toBeInTheDocument();
});

test('should create `time` element', () => {
    const now = 1724222592978;
    vi.setSystemTime(now);
    const { container } = render(<TimeAgo date={now - 3 * min} />);
    expect(container).toMatchInlineSnapshot(`
      <div>
        <time
          datetime="2024-08-21T06:40:12.978Z"
        >
          3 minutes ago
        </time>
      </div>
    `);
});

test('should not create `time` element if `timeElement` is false', () => {
    const now = 1724222592978;
    vi.setSystemTime(now);
    const { container } = render(
        <TimeAgo date={now - 5 * h} timeElement={false} />,
    );
    expect(container).toMatchInlineSnapshot(`
      <div>
        5 hours ago
      </div>
    `);
});
