import dbInit, { type ITestDb } from '../../helpers/database-init.js';
import {
    type IUnleashTest,
    setupAppWithCustomConfig,
} from '../../helpers/test-helper.js';
import getLogger from '../../../fixtures/no-logger.js';

let app: IUnleashTest;
let db: ITestDb;

beforeAll(async () => {
    db = await dbInit('tag_api_serial', getLogger);
    app = await setupAppWithCustomConfig(
        db.stores,
        {
            experimental: {
                flags: {
                    strictSchemaValidation: true,
                    tagManagementViaUi: true,
                },
            },
        },
        db.rawDatabase,
    );
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('returns list of tags', async () => {
    await app.request
        .post('/api/admin/tags')
        .send({
            value: 'Tester',
            type: 'simple',
        })
        .set('Content-Type', 'application/json');

    return app.request
        .get('/api/admin/tags')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.tags.length).toBe(1);
        });
});

test('gets a tag by type and value', async () => {
    await app.request
        .post('/api/admin/tags')
        .send({
            value: 'Tester',
            type: 'simple',
        })
        .set('Content-Type', 'application/json');
    return app.request
        .get('/api/admin/tags/simple/Tester')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.tag.value).toBe('Tester');
        });
});

test('cannot get tag that does not exist', async () => {
    expect.assertions(1);

    return app.request.get('/api/admin/tags/simple/12158091').expect((res) => {
        expect(res.status).toBe(404);
    });
});

test('Can create a tag', async () =>
    app.request
        .post('/api/admin/tags')
        .send({
            value: 'TeamRed',
            type: 'simple',
        })
        .expect((res) => {
            expect(res.status).toBe(201);
        }));

test('Can validate a tag', async () =>
    app.request
        .post('/api/admin/tags')
        .send({
            value: 124,
            type: 'not url friendly',
        })
        .expect('Content-Type', /json/)
        .expect(400)
        .expect((res) => {
            expect(res.body.details.length).toBe(1);
            expect(res.body.details[0].message).toMatch(
                '"type" must be URL friendly',
            );
        }));
test('Can delete a tag', async () => {
    await app.request
        .delete('/api/admin/tags/simple/Tester')
        .set('Content-Type', 'application/json')
        .expect(200);
    await new Promise((r) => setTimeout(r, 50));
    return app.request
        .get('/api/admin/tags')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(
                res.body.tags.indexOf(
                    (tag) => tag.value === 'Tester' && tag.type === 'simple',
                ),
            ).toBe(-1);
        });
});

test('Can tag features', async () => {
    const featureName = 'test.feature';
    const featureName2 = 'test.feature2';
    const addedTag = {
        value: 'TeamRed',
        type: 'simple',
    };
    const removedTag = {
        value: 'remove_me',
        type: 'simple',
    };
    await app.request.post('/api/admin/projects/default/features').send({
        name: featureName,
        type: 'kill-switch',
        enabled: true,
        strategies: [{ name: 'default' }],
    });

    await db.stores.tagStore.createTag(removedTag);
    await db.stores.featureTagStore.tagFeature(featureName, removedTag, -1337);

    const initialTagState = await app.request.get(
        `/api/admin/features/${featureName}/tags`,
    );

    expect(initialTagState.body).toMatchObject({ tags: [removedTag] });

    await app.request.post('/api/admin/projects/default/features').send({
        name: featureName2,
        type: 'kill-switch',
        enabled: true,
        strategies: [{ name: 'default' }],
    });

    await app.request.put('/api/admin/projects/default/tags').send({
        features: [featureName, featureName2],
        tags: {
            addedTags: [addedTag],
            removedTags: [removedTag],
        },
    });
    const res = await app.request.get(
        `/api/admin/features/${featureName}/tags`,
    );

    const res2 = await app.request.get(
        `/api/admin/features/${featureName2}/tags`,
    );

    expect(res.body).toMatchObject({ tags: [addedTag] });
    expect(res2.body).toMatchObject({ tags: [addedTag] });
});

test('Can bulk remove tags', async () => {
    const featureName = 'test.feature3';
    const featureName2 = 'test.feature4';
    const addedTag = {
        value: 'TeamRed',
        type: 'simple',
    };

    await app.request.post('/api/admin/projects/default/features').send({
        name: featureName,
        type: 'kill-switch',
        enabled: true,
        strategies: [{ name: 'default' }],
    });

    await app.request
        .post('/api/admin/projects/default/features')
        .send({
            name: featureName2,
            type: 'kill-switch',
            enabled: true,
            strategies: [{ name: 'default' }],
        })
        .expect(201);

    await app.request
        .put('/api/admin/projects/default/tags')
        .send({
            features: [featureName, featureName2],
            tags: {
                addedTags: [addedTag],
                removedTags: [],
            },
        })
        .expect(200);

    await app.request
        .put('/api/admin/projects/default/tags')
        .send({
            features: [featureName, featureName2],
            tags: {
                addedTags: [],
                removedTags: [addedTag],
            },
        })
        .expect(200);
});

test('backward compatibility: the API should return invalid tag names if they exist', async () => {
    const tag = { value: '  ', type: 'simple' };
    await db.stores.tagStore.createTag(tag);
    const { body } = await app.request.get('/api/admin/tags').expect(200);
    expect(body.tags).toContainEqual(tag);
});

test('should include tag color information when getting feature tags', async () => {
    const featureName = 'test.feature.with.color';
    const tagType = 'simple';
    const tag = {
        value: 'TeamRed',
        type: tagType,
    };

    await app.request.post('/api/admin/projects/default/features').send({
        name: featureName,
        type: 'kill-switch',
        enabled: true,
        strategies: [{ name: 'default' }],
    });

    await app.request
        .put(`/api/admin/tag-types/${tagType}`)
        .send({
            name: tagType,
            color: '#FF0000',
        })
        .expect(200);

    await app.request
        .put(`/api/admin/features/${featureName}/tags`)
        .send({ addedTags: [tag], removedTags: [] })
        .expect(200);

    const { body } = await app.request
        .get(`/api/admin/features/${featureName}/tags`)
        .expect('Content-Type', /json/)
        .expect(200);

    expect(body).toMatchObject({
        tags: [
            {
                value: 'TeamRed',
                type: 'simple',
                color: '#FF0000',
            },
        ],
    });
});

test('renames a tag on every flag that has it', async () => {
    const tag = { type: 'simple', value: 'rename-me' };
    await db.stores.tagStore.createTag(tag);
    await app.createFeature('rename.feature');
    await app.createFeature('rename.feature2');
    await db.stores.featureTagStore.tagFeature('rename.feature', tag, -1337);
    await db.stores.featureTagStore.tagFeature('rename.feature2', tag, -1337);

    const { body } = await app.request
        .post('/api/admin/tags/simple/rename-me/rename')
        .send({ value: 'renamed' })
        .expect(200);

    const renamed = { type: 'simple', value: 'renamed' };
    expect(body.tag).toEqual(renamed);
    await app.request.get('/api/admin/tags/simple/rename-me').expect(404);
    for (const feature of ['rename.feature', 'rename.feature2']) {
        const { body: featureTags } = await app.request
            .get(`/api/admin/features/${feature}/tags`)
            .expect(200);
        expect(featureTags.tags).toMatchObject([renamed]);
    }

    const events = await db
        .rawDatabase('events')
        .where({ type: 'tag-updated' })
        .select('data', 'pre_data');
    expect(events).toEqual([{ data: renamed, pre_data: tag }]);
});

test('trims the new tag value', async () => {
    await db.stores.tagStore.createTag({ type: 'simple', value: 'untrimmed' });

    const { body } = await app.request
        .post('/api/admin/tags/simple/untrimmed/rename')
        .send({ value: '  trimmed  ' })
        .expect(200);

    expect(body.tag).toEqual({ type: 'simple', value: 'trimmed' });
    await app.request.get('/api/admin/tags/simple/trimmed').expect(200);
});

test('renames a tag to a value with non-ASCII characters', async () => {
    await db.stores.tagStore.createTag({ type: 'simple', value: 'ascii' });

    const { body } = await app.request
        .post('/api/admin/tags/simple/ascii/rename')
        .send({ value: 'zażółć gęślą jaźń' })
        .expect(200);

    expect(body.tag).toEqual({ type: 'simple', value: 'zażółć gęślą jaźń' });
});

test('keeps the creation date of a renamed tag', async () => {
    const createdAt = new Date('2020-01-01T00:00:00Z');
    await db.stores.tagStore.createTag({ type: 'simple', value: 'old-tag' });
    await db
        .rawDatabase('tags')
        .where({ type: 'simple', value: 'old-tag' })
        .update({ created_at: createdAt });

    await app.request
        .post('/api/admin/tags/simple/old-tag/rename')
        .send({ value: 'new-tag' })
        .expect(200);

    const renamed = await db
        .rawDatabase('tags')
        .where({ type: 'simple', value: 'new-tag' })
        .first('created_at');
    expect(renamed).toEqual({ created_at: createdAt });
});

test('merges a tag into an existing value when renamed to it', async () => {
    const createdAt = new Date('2020-01-01T00:00:00Z');
    const source = { type: 'simple', value: 'merge-from' };
    const target = { type: 'simple', value: 'merge-into' };
    await db.stores.tagStore.createTag(source);
    await db.stores.tagStore.createTag(target);
    await db
        .rawDatabase('tags')
        .where(target)
        .update({ created_at: createdAt });
    await app.createFeature('merge.only-source');
    await app.createFeature('merge.both');
    await app.createFeature('merge.only-target');
    await db.stores.featureTagStore.tagFeature(
        'merge.only-source',
        source,
        -1337,
    );
    await db.stores.featureTagStore.tagFeature('merge.both', source, -1337);
    await db.stores.featureTagStore.tagFeature('merge.both', target, -1337);
    await db.stores.featureTagStore.tagFeature(
        'merge.only-target',
        target,
        -1337,
    );

    const { body } = await app.request
        .post('/api/admin/tags/simple/merge-from/rename')
        .send({ value: 'merge-into' })
        .expect(200);

    expect(body.tag).toEqual(target);
    await app.request.get('/api/admin/tags/simple/merge-from').expect(404);
    for (const feature of [
        'merge.only-source',
        'merge.both',
        'merge.only-target',
    ]) {
        const { body: featureTags } = await app.request
            .get(`/api/admin/features/${feature}/tags`)
            .expect(200);
        expect(featureTags.tags).toMatchObject([target]);
    }
    const merged = await db
        .rawDatabase('tags')
        .where(target)
        .first('created_at');
    expect(merged).toEqual({ created_at: createdAt });

    const events = await db
        .rawDatabase('events')
        .where({ type: 'tag-updated' })
        .whereRaw(`pre_data->>'value' = ?`, [source.value])
        .select('data', 'pre_data');
    expect(events).toEqual([{ data: target, pre_data: source }]);
});

test('renaming a tag to its own value changes nothing', async () => {
    const tag = { type: 'simple', value: 'unchanged' };
    await db.stores.tagStore.createTag(tag);
    await app.createFeature('unchanged.feature');
    await db.stores.featureTagStore.tagFeature('unchanged.feature', tag, -1337);

    const { body } = await app.request
        .post('/api/admin/tags/simple/unchanged/rename')
        .send({ value: ' unchanged ' })
        .expect(200);

    expect(body.tag).toEqual(tag);
    const { body: featureTags } = await app.request
        .get('/api/admin/features/unchanged.feature/tags')
        .expect(200);
    expect(featureTags.tags).toMatchObject([tag]);
    const events = await db
        .rawDatabase('events')
        .where({ type: 'tag-updated' })
        .whereRaw(`pre_data->>'value' = ?`, [tag.value]);
    expect(events).toEqual([]);
});

test('cannot rename a tag that does not exist', async () => {
    await app.request
        .post('/api/admin/tags/simple/does-not-exist/rename')
        .send({ value: 'whatever' })
        .expect(404);
});
