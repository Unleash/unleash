import { validateSchema } from '../validate';
import { InstanceAdminStatsSchema } from './instance-admin-stats-schema';

test('instanceAdminStatsSchema', () => {
    const data: InstanceAdminStatsSchema = {
        instanceId: '123',
        users: 0,
    };

    expect(
        validateSchema('#/components/schemas/instanceAdminStatsSchema', data),
    ).toBeUndefined();
});
