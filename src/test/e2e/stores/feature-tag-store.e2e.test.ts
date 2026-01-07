import type { IFeatureTagStore } from '../../../lib/types/stores/feature-tag-store.js';
import type { IFeatureToggleStore } from '../../../lib/features/feature-toggle/types/feature-toggle-store-type.js';
import dbInit, { type ITestDb } from '../helpers/database-init.js';
import getLogger from '../../fixtures/no-logger.js';
import NotFoundError from '../../../lib/error/notfound-error.js';
import type { IUnleashStores } from '../../../lib/types/index.js';
import { beforeAll, afterAll, afterEach, test, expect } from 'vitest';
let stores: IUnleashStores;
let db: ITestDb;
let featureTagStore: IFeatureTagStore;
let featureToggleStore: IFeatureToggleStore;

const featureName = 'test-tag';
const tag = { type: 'simple', value: 'test' };
const TESTUSERID = 3333;
const DEFAULT_TAG_COLOR = '#FFFFFF';

beforeAll(async () => {
    db = await dbInit('feature_tag_store_serial', getLogger);
    stores = db.stores;
    featureTagStore = stores.featureTagStore;
    featureToggleStore = stores.featureToggleStore;
    await stores.tagStore.createTag(tag);
    await featureToggleStore.create('default', {
        name: featureName,
        createdByUserId: 9999,
    });
});

afterAll(async () => {
    await stores.tagStore.delete(tag);
    await db.destroy();
});

afterEach(async () => {
    await featureTagStore.deleteAll();
});

test('should tag feature', async () => {
    await featureTagStore.tagFeature(featureName, tag, TESTUSERID);
    const featureTags = await featureTagStore.getAllTagsForFeature(featureName);
    const featureTag = await featureTagStore.get({
        featureName,
        tagType: tag.type,
        tagValue: tag.value,
        createdByUserId: TESTUSERID,
    });
    expect(featureTags).toHaveLength(1);
    expect(featureTags[0]).toStrictEqual({ ...tag, color: DEFAULT_TAG_COLOR });
    expect(featureTag!.featureName).toBe(featureName);
    expect(featureTag!.tagValue).toBe(tag.value);
});

test('feature tag exists', async () => {
    await featureTagStore.tagFeature(featureName, tag, TESTUSERID);
    const exists = await featureTagStore.exists({
        featureName,
        tagType: tag.type,
        tagValue: tag.value,
        createdByUserId: TESTUSERID,
    });
    expect(exists).toBe(true);
});

test('should delete feature tag', async () => {
    await featureTagStore.tagFeature(featureName, tag, TESTUSERID);
    await featureTagStore.delete({
        featureName,
        tagType: tag.type,
        tagValue: tag.value,
        createdByUserId: TESTUSERID,
    });
    const featureTags = await featureTagStore.getAllTagsForFeature(featureName);
    expect(featureTags).toHaveLength(0);
});

test('should untag feature', async () => {
    await featureTagStore.tagFeature(featureName, tag, TESTUSERID);
    await featureTagStore.untagFeature(featureName, tag);
    const featureTags = await featureTagStore.getAllTagsForFeature(featureName);
    expect(featureTags).toHaveLength(0);
});

test('get all feature tags', async () => {
    await featureTagStore.tagFeature(featureName, tag, TESTUSERID);
    await featureToggleStore.create('default', {
        name: 'some-other-toggle',
        createdByUserId: 9999,
    });
    await featureTagStore.tagFeature('some-other-toggle', tag, TESTUSERID);
    const all = await featureTagStore.getAll();
    expect(all).toHaveLength(2);
});

test('should import feature tags', async () => {
    await featureToggleStore.create('default', {
        name: 'some-other-toggle-import',
        createdByUserId: 9999,
    });
    await featureTagStore.tagFeatures([
        {
            featureName,
            tagType: tag.type,
            tagValue: tag.value,
            createdByUserId: TESTUSERID,
        },
        {
            featureName: 'some-other-toggle-import',
            tagType: tag.type,
            tagValue: tag.value,
            createdByUserId: TESTUSERID,
        },
    ]);

    const all = await featureTagStore.getAll();
    expect(all).toHaveLength(2);
});

test('should throw not found error if feature does not exist', async () => {
    await expect(async () =>
        featureTagStore.getAllTagsForFeature('non.existing.toggle'),
    ).rejects.errorWithMessage(
        new NotFoundError(
            `Could not find feature with name non.existing.toggle`,
        ),
    );
});

test('Returns empty tag list for existing feature with no tags', async () => {
    const name = 'feature.with.no.tags';
    await featureToggleStore.create('default', { name, createdByUserId: 9999 });
    const tags = await featureTagStore.getAllTagsForFeature(name);
    expect(tags).toHaveLength(0);
});
