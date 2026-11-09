import { createTestConfig } from '../../test/config/test-config.js';
import FakeEventStore from '../../test/fixtures/fake-event-store.js';
import createStores from '../../test/fixtures/store.js';
import { type IBaseEvent, TAG_CREATED } from '../events/index.js';
import { TEST_AUDIT_USER } from '../types/index.js';
import { createServices } from './index.js';

class FailingTagCreatedEventStore extends FakeEventStore {
    async batchStore(events: IBaseEvent[]): Promise<void> {
        if (events.some((event) => event.type === TAG_CREATED)) {
            throw new Error('event write failed');
        }
        return super.batchStore(events);
    }
}

test('fails tagging a flag with a new tag when the tag-created event cannot be saved', async () => {
    const stores = {
        ...createStores(),
        eventStore: new FailingTagCreatedEventStore(),
    };
    const { featureTagService } = createServices(stores, createTestConfig());
    await stores.featureToggleStore.create('default', {
        name: 'tagged-flag',
        createdByUserId: 1,
    });

    await expect(
        featureTagService.addTag(
            'tagged-flag',
            { type: 'simple', value: 'new-tag' },
            TEST_AUDIT_USER,
        ),
    ).rejects.toThrow('event write failed');
    expect(await featureTagService.listTags('tagged-flag')).toEqual([]);
});
