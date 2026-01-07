import type { IUiConfig } from 'interfaces/uiConfig';
import {
    getChangeRequestConflictCreatedData,
    getChangeRequestConflictCreatedDataFromScheduleData,
} from './change-request-conflict-data.js';
import type { ChangeRequestType } from 'component/changeRequest/changeRequest.types';

const uiConfig: Pick<IUiConfig, 'baseUriPath' | 'versionInfo'> = {
    baseUriPath: '/some-base-uri',
};
const unleashIdentifier = uiConfig.baseUriPath;
const featureId = 'flag-with-deleted-scheduler';
const strategyId = 'ed2ffa14-004c-4ed1-931b-78761681c54a';

const changeRequestWithStrategy = {
    id: 105,
    features: [
        {
            name: featureId,
            changes: [
                {
                    action: 'updateStrategy' as const,
                    payload: {
                        id: strategyId,
                    },
                },
            ],
        },
    ],
    state: 'In review' as const,
};

const changeRequestWithoutStrategy = {
    id: 106,
    features: [
        {
            name: featureId,
            changes: [
                {
                    action: 'deleteStrategy' as const,
                    payload: {
                        id: strategyId,
                    },
                },
            ],
        },
        {
            name: featureId,
            changes: [
                {
                    action: 'addStrategy' as const,
                    payload: {},
                },
            ],
        },
    ],
    state: 'In review' as const,
};

test('it finds crs that update a strategy', () => {
    const results = getChangeRequestConflictCreatedData(
        [changeRequestWithStrategy] as ChangeRequestType[],
        featureId,
        strategyId,
        uiConfig,
    );

    expect(results).toStrictEqual([
        {
            state: changeRequestWithStrategy.state,
            changeRequest: `${unleashIdentifier}#${changeRequestWithStrategy.id}`,
        },
    ]);
});

test('it does not return crs that do not update a strategy', () => {
    const results = getChangeRequestConflictCreatedData(
        [changeRequestWithoutStrategy] as ChangeRequestType[],
        featureId,
        strategyId,
        uiConfig,
    );

    expect(results).toStrictEqual([]);
});

test('it maps scheduled change request data', () => {
    const scheduledChanges = [
        {
            id: 103,
            environment: 'development',
        },
        {
            id: 104,
            environment: 'development',
        },
    ];

    const results = getChangeRequestConflictCreatedDataFromScheduleData(
        scheduledChanges,
        uiConfig,
    );

    expect(results).toStrictEqual([
        {
            state: 'Scheduled',
            changeRequest: `${unleashIdentifier}#103`,
        },
        {
            state: 'Scheduled',
            changeRequest: `${unleashIdentifier}#104`,
        },
    ]);
});
