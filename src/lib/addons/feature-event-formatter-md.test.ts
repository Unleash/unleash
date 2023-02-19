import { IEvent, FEATURE_STRATEGY_UPDATE } from '../types';

import { FeatureEventFormatterMd } from './feature-event-formatter-md';

const testCases: [string, IEvent, string][] = [
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
        'user@company.com updated *[new-feature](unleashUrl/projects/my-other-project/features/new-feature)* in project *my-other-project* by updating strategy flexibleRollout in *production* from 67% to 32%',
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
        'user@company.com updated *[new-feature](unleashUrl/projects/my-other-project/features/new-feature)* in project *my-other-project* by updating strategy flexibleRollout in *production* from default stickiness to random',
    ],
    [
        'when rollout percentage and stickiness changed',
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
        'user@company.com updated *[new-feature](unleashUrl/projects/my-other-project/features/new-feature)* in project *my-other-project* by updating strategy flexibleRollout in *production* from default stickiness to random from 67% to 32%',
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
];

testCases.forEach(([description, event, expected]) =>
    test('Should format specialised text for events ' + description, () => {
        const formatter = new FeatureEventFormatterMd('unleashUrl');
        const actual = formatter.format(event);
        expect(actual).toBe(expected);
    }),
);
