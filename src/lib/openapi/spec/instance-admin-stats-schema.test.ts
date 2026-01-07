import { validateSchema } from '../validate.js';
import type { InstanceAdminStatsSchema } from './instance-admin-stats-schema.js';

test('instanceAdminStatsSchema', () => {
    const data: InstanceAdminStatsSchema = {
        instanceId: '123',
        users: 0,
    };

    expect(
        validateSchema('#/components/schemas/instanceAdminStatsSchema', data),
    ).toBeUndefined();
});
