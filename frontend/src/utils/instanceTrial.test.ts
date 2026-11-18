import { expect, test } from 'vitest';
import {
    isTrialInstance,
    trialHasExpired,
    canExtendTrial,
    trialExpiresSoon,
} from 'utils/instanceTrial';
import { InstancePlan, InstanceState } from 'interfaces/instance';
import { subHours, addHours, addDays } from 'date-fns';

test('trialHasExpired', () => {
    expect(
        trialHasExpired({
            plan: InstancePlan.UNKNOWN,
            state: InstanceState.UNASSIGNED,
        }),
    ).toEqual(false);
    expect(
        trialHasExpired({
            plan: InstancePlan.UNKNOWN,
            state: InstanceState.ACTIVE,
        }),
    ).toEqual(false);
    expect(
        trialHasExpired({
            plan: InstancePlan.UNKNOWN,
            state: InstanceState.TRIAL,
            trialExpiry: addHours(new Date(), 2).toISOString(),
        }),
    ).toEqual(false);
    expect(
        trialHasExpired({
            plan: InstancePlan.UNKNOWN,
            state: InstanceState.TRIAL,
            trialExpiry: subHours(new Date(), 2).toISOString(),
        }),
    ).toEqual(true);
    expect(
        trialHasExpired({
            plan: InstancePlan.UNKNOWN,
            state: InstanceState.EXPIRED,
        }),
    ).toEqual(true);
    expect(
        trialHasExpired({
            plan: InstancePlan.UNKNOWN,
            state: InstanceState.DELETABLE,
        }),
    ).toEqual(true);
});

test('trialExpiresSoon', () => {
    expect(
        trialExpiresSoon({
            plan: InstancePlan.UNKNOWN,
            state: InstanceState.TRIAL,
            trialExpiry: addDays(new Date(), 12).toISOString(),
        }),
    ).toEqual(false);
    expect(
        trialExpiresSoon({
            plan: InstancePlan.UNKNOWN,
            state: InstanceState.TRIAL,
            trialExpiry: addDays(new Date(), 8).toISOString(),
        }),
    ).toEqual(true);
});

test('canExtendTrial', () => {
    expect(
        canExtendTrial({
            plan: InstancePlan.UNKNOWN,
            state: InstanceState.EXPIRED,
        }),
    ).toEqual(true);
    expect(
        canExtendTrial({
            plan: InstancePlan.UNKNOWN,
            state: InstanceState.EXPIRED,
            trialExtended: 1,
        }),
    ).toEqual(false);
});

test.each([
    [InstanceState.TRIAL, true],
    [InstanceState.EXPIRED, true],
    [InstanceState.DELETABLE, true],
    [InstanceState.CHURNED, false],
    [InstanceState.ACTIVE, false],
    [InstanceState.UNASSIGNED, false],
] as const)('classifies state %s as a trial: %s', (state, expected) => {
    expect(isTrialInstance({ plan: InstancePlan.UNKNOWN, state })).toBe(
        expected,
    );
});

test.each([
    [InstancePlan.PRO, 'pay-as-you-go', false],
    [InstancePlan.ENTERPRISE, 'subscription', false],
    [InstancePlan.ENTERPRISE, 'pay-as-you-go', true],
] as const)('preserves expired-trial treatment for churned %s with %s billing: %s', (plan, billing, expected) => {
    expect(
        trialHasExpired({ plan, billing, state: InstanceState.CHURNED }),
    ).toBe(expected);
});
