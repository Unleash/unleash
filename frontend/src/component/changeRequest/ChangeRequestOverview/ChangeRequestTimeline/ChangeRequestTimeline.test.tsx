import React from 'react';
import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { ChangeRequestTimeline, determineColor } from './ChangeRequestTimeline';
import { ChangeRequestState } from '../../changeRequest.types';

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

const irrelevantActiveIndex = -99; // Using a number that's unlikely to be a valid index
const irrelevantIndex = -99;

test('returns grey for Cancelled state regardless of displayed stage', () => {
    const stages: ChangeRequestState[] = [
        'Draft',
        'In review',
        'Approved',
        'Applied',
        'Rejected',
    ];
    stages.forEach(stage => {
        expect(
            determineColor(
                stage,
                'Cancelled',
                irrelevantActiveIndex,
                irrelevantIndex
            )
        ).toBe('grey');
    });
});

test('returns error for Rejected stage in Rejected state', () => {
    expect(
        determineColor(
            'Rejected',
            'Rejected',
            irrelevantActiveIndex,
            irrelevantIndex
        )
    ).toBe('error');
});

test('returns success for stages other than Rejected in Rejected state', () => {
    expect(
        determineColor(
            'Draft',
            'Rejected',
            irrelevantActiveIndex,
            irrelevantIndex
        )
    ).toBe('success');
    expect(
        determineColor(
            'In review',
            'Rejected',
            irrelevantActiveIndex,
            irrelevantIndex
        )
    ).toBe('success');
});

test('returns success for stages at or before activeIndex', () => {
    expect(determineColor('Draft', 'In review', 1, 0)).toBe('success');
    expect(determineColor('In review', 'In review', 1, 1)).toBe('success');
});

test('returns primary for stages right after activeIndex', () => {
    expect(determineColor('Approved', 'In review', 1, 2)).toBe('primary');
});

test('returns grey for stages two or more steps after activeIndex', () => {
    expect(determineColor('Approved', 'Draft', 0, 2)).toBe('grey');
    expect(determineColor('Applied', 'Draft', 0, 3)).toBe('grey');
});
