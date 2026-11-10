import { expect, test } from 'vitest';
import type { ChangeRequestType } from 'component/changeRequest/changeRequest.types';
import { changeRequestsUpdatingStrategy } from './changeRequestsUpdatingStrategy.js';

const featureId = 'flag-with-deleted-scheduler';
const strategyId = 'ed2ffa14-004c-4ed1-931b-78761681c54a';

const changeRequestWithStrategy = {
    features: [
        {
            name: featureId,
            changes: [
                {
                    action: 'updateStrategy' as const,
                    payload: { id: strategyId },
                },
            ],
        },
    ],
} as unknown as ChangeRequestType;

const changeRequestWithoutStrategy = {
    features: [
        {
            name: featureId,
            changes: [
                {
                    action: 'deleteStrategy' as const,
                    payload: { id: strategyId },
                },
                {
                    action: 'addStrategy' as const,
                    payload: {},
                },
            ],
        },
    ],
} as unknown as ChangeRequestType;

const changeRequestUpdatingOtherStrategy = {
    features: [
        {
            name: featureId,
            changes: [
                {
                    action: 'updateStrategy' as const,
                    payload: { id: 'other-strategy' },
                },
            ],
        },
    ],
} as unknown as ChangeRequestType;

const changeRequestOnOtherFeature = {
    features: [
        {
            name: 'other-feature',
            changes: [
                {
                    action: 'updateStrategy' as const,
                    payload: { id: strategyId },
                },
            ],
        },
    ],
} as unknown as ChangeRequestType;

test('keeps only the change requests that update the strategy', () => {
    const results = changeRequestsUpdatingStrategy(
        [
            changeRequestWithStrategy,
            changeRequestWithoutStrategy,
            changeRequestUpdatingOtherStrategy,
            changeRequestOnOtherFeature,
        ],
        featureId,
        strategyId,
    );

    expect(results).toEqual([changeRequestWithStrategy]);
});
