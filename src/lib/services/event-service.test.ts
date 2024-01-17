import { ADMIN_TOKEN_USER, IApiUser } from '../types';
import { createTestConfig } from '../../test/config/test-config';
import { createFakeEventsService } from '../../lib/features';
import { ApiTokenType } from '../../lib/types/models/api-token';

test('when using an admin token should get the username of the token and the id of the admin token user', async () => {
    const adminToken: IApiUser = {
        projects: ['*'],
        environment: '*',
        type: ApiTokenType.ADMIN,
        secret: '',
        username: 'admin-token-username',
        permissions: [],
    };
    const eventService = createFakeEventsService(createTestConfig());
    const userDetails = eventService.getUserDetails(adminToken);
    expect(userDetails.createdBy).toBe('admin-token-username');
    expect(userDetails.createdByUserId).toBe(ADMIN_TOKEN_USER.id);
});
