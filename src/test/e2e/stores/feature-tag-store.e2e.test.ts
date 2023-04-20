import { IFeatureTagStore } from 'lib/types/stores/feature-tag-store';
import { IFeatureToggleStore } from 'lib/types/stores/feature-toggle-store';
import dbInit from '../helpers/database-init';
import getLogger from '../../fixtures/no-logger';
import NotFoundError from '../../../lib/error/notfound-error';

let stores;
let db;
let featureTagStore: IFeatureTagStore;
let featureToggleStore: IFeatureToggleStore;

const featureName = 'test-tag';
const tag = { type: 'simple', value: 'test' };

beforeAll(async () => {
    db = await dbInit('feature_tag_store_serial', getLogger);
    stores = db.stores;
    featureTagStore = stores.featureTagStore;
    featureToggleStore = stores.featureToggleStore;
    await stores.tagStore.createTag(tag);
    await featureToggleStore.create('default', { name: featureName });
});

afterAll(async () => {
    await stores.tagStore.delete(tag);
    await db.destroy();
});

afterEach(async () => {
    await featureTagStore.deleteAll();
});

test('should tag feature', async () => {
    await featureTagStore.tagFeature(featureName, tag);
    const featureTags = await featureTagStore.getAllTagsForFeature(featureName);
    const featureTag = await featureTagStore.get({
        featureName,
        tagType: tag.type,
        tagValue: tag.value,
    });
    expect(featureTags).toHaveLength(1);
    expect(featureTags[0]).toStrictEqual(tag);
    expect(featureTag.featureName).toBe(featureName);
    expect(featureTag.tagValue).toBe(tag.value);
});

test('feature tag exists', async () => {
    await featureTagStore.tagFeature(featureName, tag);
    const exists = await featureTagStore.exists({
        featureName,
        tagType: tag.type,
        tagValue: tag.value,
    });
    expect(exists).toBe(true);
});

test('should delete feature tag', async () => {
    await featureTagStore.tagFeature(featureName, tag);
    await featureTagStore.delete({
        featureName,
        tagType: tag.type,
        tagValue: tag.value,
    });
    const featureTags = await featureTagStore.getAllTagsForFeature(featureName);
    expect(featureTags).toHaveLength(0);
});

test('should untag feature', async () => {
    await featureTagStore.tagFeature(featureName, tag);
    await featureTagStore.untagFeature(featureName, tag);
    const featureTags = await featureTagStore.getAllTagsForFeature(featureName);
    expect(featureTags).toHaveLength(0);
});

test('get all feature tags', async () => {
    await featureTagStore.tagFeature(featureName, tag);
    await featureToggleStore.create('default', {
        name: 'some-other-toggle',
    });
    await featureTagStore.tagFeature('some-other-toggle', tag);
    const all = await featureTagStore.getAll();
    expect(all).toHaveLength(2);
});

test('should import feature tags', async () => {
    await featureToggleStore.create('default', {
        name: 'some-other-toggle-import',
    });
    await featureTagStore.tagFeatures([
        { featureName, tagType: tag.type, tagValue: tag.value },
        {
            featureName: 'some-other-toggle-import',
            tagType: tag.type,
            tagValue: tag.value,
        },
    ]);

    const all = await featureTagStore.getAll();
    expect(all).toHaveLength(2);
});

test('should throw not found error if feature does not exist', async () => {
    await expect(async () =>
        featureTagStore.getAllTagsForFeature('non.existing.toggle'),
    ).rejects.toThrow(
        new NotFoundError(
            `Could not find feature with name non.existing.toggle`,
        ),
    );
});

test('Returns empty tag list for existing feature with no tags', async () => {
    const name = 'feature.with.no.tags';
    await featureToggleStore.create('default', { name });
    let tags = await featureTagStore.getAllTagsForFeature(name);
    expect(tags).toHaveLength(0);
});
