import type { IUnleashConfig } from '../types/option.js';
import { createTestConfig } from '../../test/config/test-config.js';
import type EventService from '../features/events/event-service.js';
import FakeTagStore from '../../test/fixtures/fake-tag-store.js';
import TagService from './tag-service.js';
import FakeTagTypeStore from '../features/tag-type/fake-tag-type-store.js';
import BadDataError from '../error/bad-data-error.js';

const config: IUnleashConfig = createTestConfig();

test('should trim tag values before saving them', async () => {
    const tagStore = new FakeTagStore();
    const tagTypeStore = new FakeTagTypeStore();
    await tagTypeStore.createTagType({ name: 'simple' });
    const service = new TagService({ tagStore, tagTypeStore }, config, {
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

test('rejects a tag whose tag type does not exist', async () => {
    const tagStore = new FakeTagStore();
    const tagTypeStore = new FakeTagTypeStore();
    const service = new TagService({ tagStore, tagTypeStore }, config, {
        storeEvent: async () => {},
    } as unknown as EventService);

    const creation = service.createTag(
        { value: 'checkout', type: 'missing-type' },
        { id: 1, username: 'audit user', ip: '' },
    );

    await expect(creation).rejects.toThrow(BadDataError);
    expect(tagStore.tags).toEqual([]);
});
