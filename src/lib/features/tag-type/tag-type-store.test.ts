import { EventEmitter } from 'events';
import type { Db } from '../../db/db.js';
import NotFoundError from '../../error/notfound-error.js';
import getLogger from '../../../test/fixtures/no-logger.js';
import FakeTagTypeStore from './fake-tag-type-store.js';
import TagTypeStore from './tag-type-store.js';

const tagType = { name: 'example', description: 'updated' };

test('update throws when the database update affects no rows', async () => {
    const update = vi.fn().mockResolvedValue(0);
    const where = vi.fn().mockReturnValue({ update });
    const db = vi.fn().mockReturnValue({ where });
    const store = new TagTypeStore(
        db as unknown as Db,
        new EventEmitter(),
        getLogger,
    );

    await expect(store.updateTagType(tagType)).rejects.toThrow(NotFoundError);
    expect(db).toHaveBeenCalledWith('tag_types');
    expect(where).toHaveBeenCalledWith({ name: tagType.name });
    expect(update).toHaveBeenCalledWith({
        description: 'updated',
        icon: undefined,
        color: undefined,
    });
});

test('update succeeds when the database update affects one row', async () => {
    const db = vi
        .fn()
        .mockReturnValue({ where: () => ({ update: async () => 1 }) });
    const store = new TagTypeStore(
        db as unknown as Db,
        new EventEmitter(),
        getLogger,
    );

    await expect(store.updateTagType(tagType)).resolves.toBeUndefined();
});

test('fake update rejects missing types without changing other types', async () => {
    const store = new FakeTagTypeStore();
    await store.createTagType({ name: 'other' });

    await expect(store.updateTagType(tagType)).rejects.toThrow(NotFoundError);
    expect(await store.getAll()).toEqual([{ name: 'other' }]);
});

test('fake update replaces an existing type', async () => {
    const store = new FakeTagTypeStore();
    await store.createTagType({ name: tagType.name });

    await store.updateTagType(tagType);
    expect(await store.getAll()).toEqual([tagType]);
});
