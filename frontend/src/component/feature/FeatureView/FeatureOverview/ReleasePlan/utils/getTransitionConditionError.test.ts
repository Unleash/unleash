import { subHours } from 'date-fns';
import { expect, test } from 'vitest';
import type { MilestoneStatus } from '../ReleasePlanMilestone/ReleasePlanMilestoneStatus.tsx';
import { getTransitionConditionError } from './getTransitionConditionError.ts';

const anHourAgo = () => subHours(new Date(), 1).toISOString();

const activeMilestone: MilestoneStatus = {
    type: 'active',
    progression: 'active',
};

test('rejects zero values with a message matching the condition type', () => {
    expect(getTransitionConditionError({ value: 0, unit: 'hours' })).toBe(
        'Time cannot be zero',
    );
    expect(getTransitionConditionError({ value: 0, unit: 'exposures' })).toBe(
        'Exposures cannot be zero',
    );
});

test('rejects fractional values for both condition types', () => {
    expect(getTransitionConditionError({ value: 2.5, unit: 'minutes' })).toBe(
        'Value must be a whole number',
    );
    expect(getTransitionConditionError({ value: 2.5, unit: 'exposures' })).toBe(
        'Value must be a whole number',
    );
});

test('caps time values but not exposure values', () => {
    expect(getTransitionConditionError({ value: 10001, unit: 'minutes' })).toBe(
        'Value cannot exceed 10000',
    );
    expect(
        getTransitionConditionError({ value: 10001, unit: 'exposures' }),
    ).toBeUndefined();
});

test('rejects a time interval that puts the next milestone start in the past', () => {
    expect(
        getTransitionConditionError({
            value: 30,
            unit: 'minutes',
            sourceMilestoneStartedAt: anHourAgo(),
            status: activeMilestone,
        }),
    ).toContain("can't start in the past");
});

test('exposure conditions skip the past start date check', () => {
    expect(
        getTransitionConditionError({
            value: 1000,
            unit: 'exposures',
            sourceMilestoneStartedAt: anHourAgo(),
            status: activeMilestone,
        }),
    ).toBeUndefined();
});

test('the past start date check only applies to running milestones', () => {
    expect(
        getTransitionConditionError({
            value: 30,
            unit: 'minutes',
            sourceMilestoneStartedAt: anHourAgo(),
            status: { type: 'not-started', progression: 'active' },
        }),
    ).toBeUndefined();
});
