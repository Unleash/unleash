import { screen, within } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import {
    ChangeRequestTimeline,
    determineColor,
    getScheduleProps,
} from './ChangeRequestTimeline.tsx';
import type { ChangeRequestState } from '../../changeRequest.types';

test('cancelled timeline shows expected states', () => {
    render(<ChangeRequestTimeline state={'Cancelled'} />);

    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(screen.getByText('In review')).toBeInTheDocument();
    expect(screen.getByText('Approved')).toBeInTheDocument();
    expect(screen.getByText('Cancelled')).toBeInTheDocument();
});

test('approved timeline shows all states', () => {
    render(<ChangeRequestTimeline state={'Approved'} />);

    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(screen.getByText('In review')).toBeInTheDocument();
    expect(screen.getByText('Approved')).toBeInTheDocument();
    expect(screen.getByText('Applied')).toBeInTheDocument();
});

test('applied timeline shows all states', () => {
    render(<ChangeRequestTimeline state={'Applied'} />);

    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(screen.getByText('In review')).toBeInTheDocument();
    expect(screen.getByText('Approved')).toBeInTheDocument();
    expect(screen.getByText('Applied')).toBeInTheDocument();
});

test('rejected timeline shows all states', () => {
    render(<ChangeRequestTimeline state={'Rejected'} />);

    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(screen.getByText('In review')).toBeInTheDocument();
    expect(screen.getByText('Rejected')).toBeInTheDocument();
    expect(screen.queryByText('Approved')).not.toBeInTheDocument();
    expect(screen.queryByText('Applied')).not.toBeInTheDocument();
});

test('scheduled timeline shows all states', () => {
    render(
        <ChangeRequestTimeline
            state={'Scheduled'}
            schedule={{
                scheduledAt: new Date().toISOString(),
                status: 'pending',
            }}
        />,
    );

    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(screen.getByText('In review')).toBeInTheDocument();
    expect(screen.queryByText('Approved')).toBeInTheDocument();
    expect(screen.getByText('Scheduled')).toBeInTheDocument();
    expect(screen.queryByText('Applied')).toBeInTheDocument();
});

const irrelevantIndex = -99; // Using a number that's unlikely to be a valid index

test('returns grey for Cancelled state regardless of displayed stage', () => {
    const stages: ChangeRequestState[] = [
        'Draft',
        'In review',
        'Approved',
        'Applied',
        'Rejected',
    ];
    stages.forEach((stage) => {
        expect(
            determineColor(
                'Cancelled',
                irrelevantIndex,
                stage,
                irrelevantIndex,
            ),
        ).toBe('grey');
    });
});

test('returns error for Rejected stage in Rejected state', () => {
    expect(
        determineColor(
            'Rejected',
            irrelevantIndex,
            'Rejected',
            irrelevantIndex,
        ),
    ).toBe('error');
});

test('returns success for stages other than Rejected in Rejected state', () => {
    expect(
        determineColor('Rejected', irrelevantIndex, 'Draft', irrelevantIndex),
    ).toBe('success');
    expect(
        determineColor(
            'Rejected',
            irrelevantIndex,
            'In review',
            irrelevantIndex,
        ),
    ).toBe('success');
});

describe('changeRequestScheduleProps', () => {
    test('returns correct props for a pending schedule', () => {
        const date = new Date();
        const schedule = {
            scheduledAt: date.toISOString(),
            status: 'pending' as const,
        };

        const { title, timeInfo, color, reason } = getScheduleProps(schedule);
        expect(title).toBe('Scheduled');
        expect(color).toBe('warning');
        expect(reason).toBeNull();

        render(timeInfo);
        screen.getByText('for');
        const timeElement = screen.getByRole('time');
        const datetime = timeElement.getAttribute('datetime');
        expect(new Date(datetime || 1)).toEqual(date);
    });

    test('returns correct props for a failed schedule', () => {
        const date = new Date();
        const schedule = {
            scheduledAt: date.toISOString(),
            status: 'failed' as const,
            reason: 'reason',
            failureReason: 'failure reason',
        };

        const { title, timeInfo, color, reason } = getScheduleProps(schedule);
        expect(title).toBe('Schedule failed');
        expect(color).toBe('error');
        expect(reason).toBeTruthy();

        render(timeInfo);
        screen.getByText('at');
        const timeElement = screen.getByRole('time');
        const datetime = timeElement.getAttribute('datetime');
        expect(new Date(datetime || 1)).toEqual(date);
    });

    test('returns correct props for a suspended schedule', () => {
        const date = new Date();
        const schedule = {
            scheduledAt: date.toISOString(),
            status: 'suspended' as const,
            reason: 'reason',
        };

        const { title, timeInfo, color, reason } = getScheduleProps(schedule);
        expect(title).toBe('Schedule suspended');
        expect(color).toBe('grey');
        expect(reason).toBeTruthy();

        render(timeInfo);
        screen.getByText('was');
        const timeElement = screen.getByRole('time');
        const datetime = timeElement.getAttribute('datetime');
        expect(new Date(datetime || 1)).toEqual(date);
    });
});

test('returns success for stages at or before activeIndex', () => {
    expect(determineColor('In review', 1, 'Draft', 0)).toBe('success');
    expect(determineColor('In review', 1, 'In review', 1)).toBe('success');
});

test('returns primary for stages right after activeIndex', () => {
    expect(determineColor('In review', 1, 'Approved', 2)).toBe('primary');
});

test('returns grey for stages two or more steps after activeIndex', () => {
    expect(determineColor('Draft', 0, 'Approved', 2)).toBe('grey');
    expect(determineColor('Draft', 0, 'Applied', 3)).toBe('grey');
});

describe('Timestamps', () => {
    test('Displays timestamps for stages if available', () => {
        const timestamps = {
            Draft: '2023-01-01T00:00:00Z',
            'In review': '2023-01-02T00:00:00Z',
            Approved: '2023-01-03T00:00:00Z',
        };
        render(
            <ChangeRequestTimeline
                state={'Approved'}
                timestamps={timestamps}
            />,
        );

        const timeElements = screen.getAllByRole('time');
        expect(timeElements.length).toBe(3);
        for (const time of Object.values(timestamps)) {
            expect(
                timeElements.some(
                    (element) => element.getAttribute('datetime') === time,
                ),
            ).toBe(true);
        }
    });

    test('Shows stages without timestamps if they are not available', () => {
        const timestamps = {
            Draft: '2023-01-01T00:00:00Z',
            Approved: '2023-01-03T00:00:00Z',
        };
        render(
            <ChangeRequestTimeline
                state={'Approved'}
                timestamps={timestamps}
            />,
        );

        const inReview = screen.getByText('In review');
        const inReviewTimestamp = within(inReview).queryByRole('time');
        expect(inReviewTimestamp).toBeNull();

        const timeElements = screen.getAllByRole('time');
        expect(timeElements.length).toBe(2);
        for (const time of Object.values(timestamps)) {
            expect(
                timeElements.some(
                    (element) => element.getAttribute('datetime') === time,
                ),
            ).toBe(true);
        }
    });

    test('Existing timestamps in upcoming stages are not shown', () => {
        const timestamps = {
            Draft: '2023-01-01T00:00:00Z',
            'In review': '2023-01-03T00:00:00Z',
            Approved: '2023-01-02T00:00:00Z',
        };
        render(
            <ChangeRequestTimeline
                state={'In review'}
                timestamps={timestamps}
            />,
        );

        const timeElements = screen.getAllByRole('time');
        expect(timeElements.length).toBe(2);
        expect(
            timeElements.some(
                (element) =>
                    element.getAttribute('datetime') === timestamps.Approved,
            ),
        ).toBe(false);
    });
});
