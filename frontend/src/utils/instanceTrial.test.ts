import {
    hasTrialExpired,
    formatTrialExpirationWarning,
} from 'utils/instanceTrial';
import { InstancePlan, InstanceState } from 'interfaces/instance';
import { subHours, addHours, addMinutes, subMinutes } from 'date-fns';

test.each([
    undefined,
    { plan: InstancePlan.UNKNOWN },
    { plan: InstancePlan.UNKNOWN, state: InstanceState.ACTIVE },
    { plan: InstancePlan.UNKNOWN, state: InstanceState.TRIAL },
    { plan: InstancePlan.COMPANY, state: InstanceState.TRIAL },
    { plan: InstancePlan.PRO, state: InstanceState.TRIAL },
])('unknown trial states should not count as expired', input => {
    expect(hasTrialExpired(input)).toEqual(false);
    expect(formatTrialExpirationWarning(input)).toEqual(undefined);
});

test('hasTrialExpired', () => {
    expect(
        hasTrialExpired({
            plan: InstancePlan.UNKNOWN,
            state: InstanceState.TRIAL,
            trialExpiry: subHours(new Date(), 2).toISOString(),
        })
    ).toEqual(true);
    expect(
        hasTrialExpired({
            plan: InstancePlan.UNKNOWN,
            state: InstanceState.TRIAL,
            trialExpiry: addHours(new Date(), 2).toISOString(),
        })
    ).toEqual(false);
});

test('formatTrialExpirationWarning', () => {
    expect(
        formatTrialExpirationWarning({
            plan: InstancePlan.UNKNOWN,
            state: InstanceState.TRIAL,
            trialExpiry: subMinutes(new Date(), 1).toISOString(),
        })
    ).toEqual(undefined);
    expect(
        formatTrialExpirationWarning({
            plan: InstancePlan.UNKNOWN,
            state: InstanceState.TRIAL,
            trialExpiry: addMinutes(new Date(), 23 * 60 + 1).toISOString(),
        })
    ).toEqual('23 hours');
    expect(
        formatTrialExpirationWarning({
            plan: InstancePlan.UNKNOWN,
            state: InstanceState.TRIAL,
            trialExpiry: addHours(new Date(), 25).toISOString(),
        })
    ).toEqual('1 day');
    expect(
        formatTrialExpirationWarning({
            plan: InstancePlan.UNKNOWN,
            state: InstanceState.TRIAL,
            trialExpiry: addHours(new Date(), 24 * 11 - 1).toISOString(),
        })
    ).toEqual('10 days');
});
