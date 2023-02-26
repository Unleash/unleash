import {
    FEATURE_STRATEGY_ADD,
    FEATURE_STRATEGY_REMOVE,
    FEATURE_STRATEGY_UPDATE,
    IEvent,
} from '../types';

import { FeatureEventFormatterMd } from './feature-event-formatter-md';
import {
    DATE_AFTER,
    DATE_BEFORE,
    IN,
    NOT_IN,
    NUM_EQ,
    NUM_GT,
    NUM_GTE,
    NUM_LT,
    NUM_LTE,
    SEMVER_EQ,
    SEMVER_GT,
    SEMVER_LT,
    STR_CONTAINS,
    STR_ENDS_WITH,
    STR_STARTS_WITH,
} from '../util';

const testCases: [string, IEvent, string][] = [
    [
        'when groupId changed',
        {
            id: 920,
            type: FEATURE_STRATEGY_UPDATE,
            createdBy: 'user@company.com',
            createdAt: new Date('2022-06-01T10:03:11.549Z'),
            data: {
                id: '3f4bf713-696c-43a4-8ce7-d6c607108858',
                name: 'flexibleRollout',
                constraints: [],
                parameters: {
                    groupId: 'different-feature',
                    rollout: '32',
                    stickiness: 'default',
                },
            },
            preData: {
                id: '3f4bf713-696c-43a4-8ce7-d6c607108858',
                name: 'flexibleRollout',
                parameters: {
                    groupId: 'new-feature',
                    rollout: '32',
                    stickiness: 'default',
                },
                constraints: [],
            },
            tags: [],
            featureName: 'new-feature',
            project: 'my-other-project',
            environment: 'production',
        },
        'user@company.com updated *[new-feature](unleashUrl/projects/my-other-project/features/new-feature)* in project *my-other-project* by updating strategy flexibleRollout in *production* groupId from new-feature to different-feature',
    ],
    [
        'when rollout percentage changed',
        {
            id: 920,
            type: FEATURE_STRATEGY_UPDATE,
            createdBy: 'user@company.com',
            createdAt: new Date('2022-06-01T10:03:11.549Z'),
            data: {
                id: '3f4bf713-696c-43a4-8ce7-d6c607108858',
                name: 'flexibleRollout',
                constraints: [],
                parameters: {
                    groupId: 'new-feature',
                    rollout: '32',
                    stickiness: 'default',
                },
            },
            preData: {
                id: '3f4bf713-696c-43a4-8ce7-d6c607108858',
                name: 'flexibleRollout',
                parameters: {
                    groupId: 'new-feature',
                    rollout: '67',
                    stickiness: 'default',
                },
                constraints: [],
            },
            tags: [],
            featureName: 'new-feature',
            project: 'my-other-project',
            environment: 'production',
        },
        'user@company.com updated *[new-feature](unleashUrl/projects/my-other-project/features/new-feature)* in project *my-other-project* by updating strategy flexibleRollout in *production* rollout from 67% to 32%',
    ],
    [
        'when stickiness changed',
        {
            id: 920,
            type: FEATURE_STRATEGY_UPDATE,
            createdBy: 'user@company.com',
            createdAt: new Date('2022-06-01T10:03:11.549Z'),
            data: {
                id: '3f4bf713-696c-43a4-8ce7-d6c607108858',
                name: 'flexibleRollout',
                constraints: [],
                parameters: {
                    groupId: 'new-feature',
                    rollout: '67',
                    stickiness: 'random',
                },
            },
            preData: {
                id: '3f4bf713-696c-43a4-8ce7-d6c607108858',
                name: 'flexibleRollout',
                parameters: {
                    groupId: 'new-feature',
                    rollout: '67',
                    stickiness: 'default',
                },
                constraints: [],
            },
            tags: [],
            featureName: 'new-feature',
            project: 'my-other-project',
            environment: 'production',
        },
        'user@company.com updated *[new-feature](unleashUrl/projects/my-other-project/features/new-feature)* in project *my-other-project* by updating strategy flexibleRollout in *production* stickiness from default to random',
    ],
    [
        'when constraints and rollout percentage and stickiness changed',
        {
            id: 920,
            type: FEATURE_STRATEGY_UPDATE,
            createdBy: 'user@company.com',
            createdAt: new Date('2022-06-01T10:03:11.549Z'),
            data: {
                id: '3f4bf713-696c-43a4-8ce7-d6c607108858',
                name: 'flexibleRollout',
                constraints: [
                    {
                        values: ['x', 'y'],
                        inverted: false,
                        operator: IN,
                        contextName: 'appName',
                        caseInsensitive: false,
                    },
                ],
                parameters: {
                    groupId: 'new-feature',
                    rollout: '32',
                    stickiness: 'random',
                },
            },
            preData: {
                id: '3f4bf713-696c-43a4-8ce7-d6c607108858',
                name: 'flexibleRollout',
                parameters: {
                    groupId: 'new-feature',
                    rollout: '67',
                    stickiness: 'default',
                },
                constraints: [],
            },
            tags: [],
            featureName: 'new-feature',
            project: 'my-other-project',
            environment: 'production',
        },
        'user@company.com updated *[new-feature](unleashUrl/projects/my-other-project/features/new-feature)* in project *my-other-project* by updating strategy flexibleRollout in *production* stickiness from default to random; rollout from 67% to 32%; constraints from empty set of constraints to [appName is one of (x,y)]',
    ],
    [
        'when neither rollout percentage nor stickiness changed',
        {
            id: 920,
            type: FEATURE_STRATEGY_UPDATE,
            createdBy: 'user@company.com',
            createdAt: new Date('2022-06-01T10:03:11.549Z'),
            data: {
                id: '3f4bf713-696c-43a4-8ce7-d6c607108858',
                name: 'flexibleRollout',
                constraints: [],
                parameters: {
                    groupId: 'new-feature',
                    rollout: '67',
                    stickiness: 'default',
                },
            },
            preData: {
                id: '3f4bf713-696c-43a4-8ce7-d6c607108858',
                name: 'flexibleRollout',
                parameters: {
                    groupId: 'new-feature',
                    rollout: '67',
                    stickiness: 'default',
                },
                constraints: [],
            },
            tags: [],
            featureName: 'new-feature',
            project: 'my-other-project',
            environment: 'production',
        },
        'user@company.com updated *[new-feature](unleashUrl/projects/my-other-project/features/new-feature)* in project *my-other-project* by updating strategy flexibleRollout in *production*',
    ],
    [
        'when strategy added',
        {
            id: 919,
            type: FEATURE_STRATEGY_ADD,
            createdBy: 'user@company.com',
            createdAt: new Date('2022-06-01T10:03:08.290Z'),
            data: {
                id: '3f4bf713-696c-43a4-8ce7-d6c607108858',
                name: 'flexibleRollout',
                constraints: [],
                parameters: {
                    groupId: 'new-feature',
                    rollout: '67',
                    stickiness: 'default',
                },
            },
            preData: null,
            tags: [],
            featureName: 'new-feature',
            project: 'my-other-project',
            environment: 'production',
        },
        'user@company.com updated *[new-feature](unleashUrl/projects/my-other-project/features/new-feature)* in project *my-other-project* by adding strategy flexibleRollout in *production*',
    ],
    [
        'when strategy removed',
        {
            id: 918,
            type: FEATURE_STRATEGY_REMOVE,
            createdBy: 'user@company.com',
            createdAt: new Date('2022-06-01T10:03:00.229Z'),
            data: null,
            preData: {
                id: '9591090e-acb0-4088-8958-21faaeb7147d',
                name: 'default',
                parameters: {},
                constraints: [],
            },
            tags: [],
            featureName: 'new-feature',
            project: 'my-other-project',
            environment: 'production',
        },
        'user@company.com updated *[new-feature](unleashUrl/projects/my-other-project/features/new-feature)* in project *my-other-project* by removing strategy default in *production*',
    ],
    ...[
        [IN, 'is one of'],
        [NOT_IN, 'is not one of'],
        [STR_CONTAINS, 'is a string that contains'],
        [STR_STARTS_WITH, 'is a string that starts with'],
        [STR_ENDS_WITH, 'is a string that ends with'],
    ].map(
        ([operator, display]) =>
            <[string, IEvent, string]>[
                'when default strategy updated',
                {
                    id: 39,
                    type: FEATURE_STRATEGY_UPDATE,
                    createdBy: 'admin',
                    createdAt: new Date('2023-02-20T20:23:28.791Z'),
                    data: {
                        id: 'f2d34aac-52ec-49d2-82d3-08d710e89eaa',
                        name: 'default',
                        constraints: [
                            {
                                values: ['x', 'y'],
                                inverted: false,
                                operator: operator,
                                contextName: 'appName',
                                caseInsensitive: false,
                            },
                            {
                                values: ['x'],
                                inverted: true,
                                operator: operator,
                                contextName: 'appName',
                                caseInsensitive: false,
                            },
                        ],
                        parameters: {},
                        segments: [],
                    },
                    preData: {
                        id: 'f2d34aac-52ec-49d2-82d3-08d710e89eaa',
                        name: 'default',
                        segments: [],
                        parameters: {},
                        constraints: [],
                    },
                    tags: [],
                    featureName: 'aaa',
                    project: 'default',
                    environment: 'production',
                },
                `admin updated *[aaa](unleashUrl/projects/default/features/aaa)* in project *default* by updating strategy default in *production* constraints from empty set of constraints to [appName ${display} (x,y), appName not ${display} (x)]`,
            ],
    ),
    ...[
        [NUM_EQ, 'is a number equal to'],
        [NUM_GT, 'is a number greater than'],
        [NUM_GTE, 'is a number greater than or equal to'],
        [NUM_LT, 'is a number less than'],
        [NUM_LTE, 'is a number less than or equal to'],
        [DATE_BEFORE, 'is a date before'],
        [DATE_AFTER, 'is a date after'],
        [SEMVER_EQ, 'is a SemVer equal to'],
        [SEMVER_GT, 'is a SemVer greater than'],
        [SEMVER_LT, 'is a SemVer less than'],
    ].map(
        ([operator, display]) =>
            <[string, IEvent, string]>[
                'when default strategy updated with numeric constraint ' +
                    operator,
                {
                    id: 39,
                    type: FEATURE_STRATEGY_UPDATE,
                    createdBy: 'admin',
                    createdAt: new Date('2023-02-20T20:23:28.791Z'),
                    data: {
                        id: 'f2d34aac-52ec-49d2-82d3-08d710e89eaa',
                        name: 'default',
                        constraints: [],
                        parameters: {},
                        segments: [],
                    },
                    preData: {
                        id: 'f2d34aac-52ec-49d2-82d3-08d710e89eaa',
                        name: 'default',
                        segments: [],
                        parameters: {},
                        constraints: [
                            {
                                value: '4',
                                values: [],
                                inverted: false,
                                operator: operator,
                                contextName: 'appName',
                                caseInsensitive: false,
                            },
                        ],
                    },
                    tags: [],
                    featureName: 'aaa',
                    project: 'default',
                    environment: 'production',
                },
                `admin updated *[aaa](unleashUrl/projects/default/features/aaa)* in project *default* by updating strategy default in *production* constraints from [appName ${display} 4] to empty set of constraints`,
            ],
    ),
    [
        'when userIds changed',
        {
            id: 920,
            type: FEATURE_STRATEGY_UPDATE,
            createdBy: 'user@company.com',
            createdAt: new Date('2022-06-01T10:03:11.549Z'),
            data: {
                name: 'userWithId',
                constraints: [
                    {
                        values: ['x', 'y'],
                        inverted: false,
                        operator: IN,
                        contextName: 'appName',
                        caseInsensitive: false,
                    },
                ],
                parameters: {
                    userIds: 'a,b',
                },
                sortOrder: 9999,
                id: '9a995d94-5944-4897-a82f-0f7e65c2fb3f',
            },
            preData: {
                name: 'userWithId',
                constraints: [],
                parameters: {
                    userIds: '',
                },
                sortOrder: 9999,
                id: '9a995d94-5944-4897-a82f-0f7e65c2fb3f',
            },
            tags: [],
            featureName: 'new-feature',
            project: 'my-other-project',
            environment: 'production',
        },
        'user@company.com updated *[new-feature](unleashUrl/projects/my-other-project/features/new-feature)* in project *my-other-project* by updating strategy userWithId in *production* userIds from empty set of userIds to [a,b]; constraints from empty set of constraints to [appName is one of (x,y)]',
    ],
    [
        'when IPs changed',
        {
            id: 920,
            type: FEATURE_STRATEGY_UPDATE,
            createdBy: 'user@company.com',
            createdAt: new Date('2022-06-01T10:03:11.549Z'),
            data: {
                name: 'remoteAddress',
                constraints: [
                    {
                        values: ['x', 'y'],
                        inverted: false,
                        operator: IN,
                        contextName: 'appName',
                        caseInsensitive: false,
                    },
                ],
                parameters: {
                    IPs: '127.0.0.1',
                },
            },
            preData: {
                name: 'remoteAddress',
                constraints: [],
                parameters: {
                    IPs: '',
                },
            },
            tags: [],
            featureName: 'new-feature',
            project: 'my-other-project',
            environment: 'production',
        },
        'user@company.com updated *[new-feature](unleashUrl/projects/my-other-project/features/new-feature)* in project *my-other-project* by updating strategy remoteAddress in *production* IPs from empty set of IPs to [127.0.0.1]; constraints from empty set of constraints to [appName is one of (x,y)]',
    ],
    [
        'when host names changed',
        {
            id: 920,
            type: FEATURE_STRATEGY_UPDATE,
            createdBy: 'user@company.com',
            createdAt: new Date('2022-06-01T10:03:11.549Z'),
            data: {
                name: 'applicationHostname',
                constraints: [
                    {
                        values: ['x', 'y'],
                        inverted: false,
                        operator: IN,
                        contextName: 'appName',
                        caseInsensitive: false,
                    },
                ],
                parameters: {
                    hostNames: 'unleash.com',
                },
            },
            preData: {
                name: 'applicationHostname',
                constraints: [],
                parameters: {
                    hostNames: '',
                },
            },
            tags: [],
            featureName: 'new-feature',
            project: 'my-other-project',
            environment: 'production',
        },
        'user@company.com updated *[new-feature](unleashUrl/projects/my-other-project/features/new-feature)* in project *my-other-project* by updating strategy applicationHostname in *production* hostNames from empty set of hostNames to [unleash.com]; constraints from empty set of constraints to [appName is one of (x,y)]',
    ],
    [
        'when no specific text for strategy exists yet',
        {
            id: 920,
            type: FEATURE_STRATEGY_UPDATE,
            createdBy: 'user@company.com',
            createdAt: new Date('2022-06-01T10:03:11.549Z'),
            data: {
                name: 'newStrategy',
                constraints: [
                    {
                        values: ['x', 'y'],
                        inverted: false,
                        operator: IN,
                        contextName: 'appName',
                        caseInsensitive: false,
                    },
                ],
                parameters: {
                    IPs: '127.0.0.1',
                },
            },
            preData: {
                name: 'newStrategy',
                constraints: [],
                parameters: {
                    IPs: '',
                },
            },
            tags: [],
            featureName: 'new-feature',
            project: 'my-other-project',
            environment: 'production',
        },
        'user@company.com updated *[new-feature](unleashUrl/projects/my-other-project/features/new-feature)* in project *my-other-project* by updating strategy newStrategy in *production*',
    ],
];

testCases.forEach(([description, event, expected]) =>
    test('Should format specialised text for events ' + description, () => {
        const formatter = new FeatureEventFormatterMd('unleashUrl');
        const actual = formatter.format(event);
        expect(actual).toBe(expected);
    }),
);
