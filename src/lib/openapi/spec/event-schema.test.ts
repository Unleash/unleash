import { validateSchema } from '../validate';
import { EventSchema } from './event-schema';

test('eventSchema', () => {
    const data: EventSchema = {
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
        tags: [{ type: 'simple', value: 'my-val' }],
        featureName: 'new-feature',
        project: 'my-project',
        environment: null,
    };

    expect(
        validateSchema('#/components/schemas/eventSchema', data),
    ).toBeUndefined();
});
