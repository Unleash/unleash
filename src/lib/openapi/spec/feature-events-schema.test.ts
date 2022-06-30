import { validateSchema } from '../validate';
import {
    FeatureEventsSchema,
    featureEventsSchema,
} from './feature-events-schema';

test('featureEventsSchema', () => {
    const data: FeatureEventsSchema = {
        toggleName: 'my-feature',
        events: [
            {
                id: 899,
                type: 'feature-created',
                createdBy: 'user@company.com',
                createdAt: '2022-05-31T13:32:20.560Z',
                data: {
                    name: 'new-feature',
                    description: 'Toggle description',
                    type: 'release',
                    project: 'my-project',
                    stale: false,
                    variants: [],
                    createdAt: '2022-05-31T13:32:20.547Z',
                    lastSeenAt: null,
                    impressionData: true,
                },
                preData: null,
                tags: [],
                featureName: 'new-feature',
                project: 'my-project',
                environment: null,
            },
        ],
    };

    expect(validateSchema(featureEventsSchema.$id, data)).toBeUndefined();
});

test('featureEventsSchema types', () => {
    const data: FeatureEventsSchema = {
        toggleName: 'my-feature',
        events: [
            {
                // @ts-expect-error
                id: '1',
                type: 'feature-created',
                createdBy: 'user@company.com',
                createdAt: '2022-05-31T13:32:20.560Z',
                data: {
                    name: 'new-feature',
                    description: 'Toggle description',
                    type: 'release',
                    project: 'my-project',
                    stale: false,
                    variants: [],
                    createdAt: '2022-05-31T13:32:20.547Z',
                    lastSeenAt: null,
                    impressionData: true,
                },
                preData: null,
                tags: [
                    {
                        type: '',
                        // @ts-expect-error
                        value: 1,
                    },
                ],
                featureName: 'new-feature',
                project: 'my-project',
                environment: null,
            },
        ],
    };

    expect(validateSchema(featureEventsSchema.$id, data)).not.toBeUndefined();
});
