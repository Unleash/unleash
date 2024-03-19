import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import {
    ChangeRequestTimeline,
    determineColor,
    getScheduleProps,
} from './ChangeRequestTimeline';
import type { ChangeRequestState } from '../../changeRequest.types';

test('cancelled timeline shows all states', () => {
    render(<ChangeRequestTimeline state={'Cancelled'} />);

    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(screen.getByText('In review')).toBeInTheDocument();
    expect(screen.getByText('Approved')).toBeInTheDocument();
    expect(screen.getByText('Applied')).toBeInTheDocument();
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
        const schedule = {
            scheduledAt: new Date().toISOString(),
            status: 'pending' as const,
        };

        const time = 'some time string';

        const { title, subtitle, color, reason } = getScheduleProps(
            schedule,
            time,
        );
        expect(title).toBe('Scheduled');
        expect(subtitle).toBe(`for ${time}`);
        expect(color).toBe('warning');
        expect(reason).toBeNull();
    });

    test('returns correct props for a failed schedule', () => {
        const schedule = {
            scheduledAt: new Date().toISOString(),
            status: 'failed' as const,
            reason: 'reason',
            failureReason: 'failure reason',
        };

        const time = 'some time string';

        const { title, subtitle, color, reason } = getScheduleProps(
            schedule,
            time,
        );
        expect(title).toBe('Schedule failed');
        expect(subtitle).toBe(`at ${time}`);
        expect(color).toBe('error');
        expect(reason).toBeTruthy();
    });

    test('returns correct props for a suspended schedule', () => {
        const schedule = {
            scheduledAt: new Date().toISOString(),
            status: 'suspended' as const,
            reason: 'reason',
        };

        const time = 'some time string';

        const { title, subtitle, color, reason } = getScheduleProps(
            schedule,
            time,
        );
        expect(title).toBe('Schedule suspended');
        expect(subtitle).toBe(`was ${time}`);
        expect(color).toBe('grey');
        expect(reason).toBeTruthy();
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
