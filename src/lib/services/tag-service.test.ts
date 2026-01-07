import type { IUnleashConfig } from '../types/option.js';
import { createTestConfig } from '../../test/config/test-config.js';
import type EventService from '../features/events/event-service.js';
import FakeTagStore from '../../test/fixtures/fake-tag-store.js';
import TagService from './tag-service.js';

const config: IUnleashConfig = createTestConfig();

test('should trim tag values before saving them', async () => {
    const tagStore = new FakeTagStore();
    const service = new TagService({ tagStore }, config, {
        storeEvent: async () => {},
    } as unknown as EventService);

    await service.createTag(
        {
            value: '  test  ',
            type: 'simple',
        },
        { id: 1, username: 'audit user', ip: '' },
    );

    expect(tagStore.tags).toMatchObject([
        {
            value: 'test',
            type: 'simple',
        },
    ]);
});
