import { createTestConfig } from '../../../test/config/test-config.js';
import { NotFoundError } from '../../error/index.js';
import { createFakeTagTypeService } from './createTagTypeService.js';

test('throws NotFoundError when listing value usage of an unknown tag type', async () => {
    const tagTypeService = createFakeTagTypeService(createTestConfig());

    await expect(
        tagTypeService.getValuesWithUsage(
            'does-not-exist',
            { limit: 10, offset: 0 },
            1,
        ),
    ).rejects.toThrow(NotFoundError);
});
