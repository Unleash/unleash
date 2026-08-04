import { addDays } from 'date-fns';
import { createTestConfig } from '../../../test/config/test-config.js';
import { TEST_AUDIT_USER } from '../../types/core.js';
import { createFakePatService } from './createPatService.js';

describe('getAll', () => {
    it('warns about a token approaching expiry', async () => {
        const config = createTestConfig({
            experimental: { flags: { tokenExpiryNotifications: true } },
            tokenExpiryNotificationDays: [14, 3],
        });
        const service = createFakePatService(config);
        const createdAt = new Date();
        await service.createPat(
            {
                description: 'my token',
                expiresAt: addDays(createdAt, 10).toISOString(),
            },
            1,
            TEST_AUDIT_USER,
        );

        const tokens = await service.getAll(1, addDays(createdAt, 6));

        expect(tokens[0].expiryWarning).toBe('expires-soon');
    });
});
