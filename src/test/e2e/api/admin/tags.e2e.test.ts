import dbInit, { type ITestDb } from '../../helpers/database-init.js';
import {
    type IUnleashTest,
    setupAppWithCustomConfig,
} from '../../helpers/test-helper.js';
import getLogger from '../../../fixtures/no-logger.js';
import { ApiTokenType } from '../../../../lib/types/model.js';
import { TEST_AUDIT_USER } from '../../../../lib/types/index.js';
import type { ITag } from '../../../../lib/tags/index.js';
import { randomId } from '../../../../lib/util/random-id.js';

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

test('creates a tag with a non-ASCII value', async () => {
    const { headers } = await app.request
        .post('/api/admin/tags')
        .send({ type: 'simple', value: 'zażółć 🚀' })
        .expect(201);

    expect(headers.location).toBe(
        `tags/simple/${encodeURIComponent('zażółć 🚀')}`,
    );
    await app.request
        .get(`/api/admin/tags/simple/${encodeURIComponent('zażółć 🚀')}`)
        .expect(200);
});

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

test('Can add the same new tag twice in one request', async () => {
    const tag = { type: 'simple', value: 'TeamBlue' };
    await app.createFeature('duplicate.tag.feature');
    await app.request.get('/api/admin/tags/simple/TeamBlue').expect(404);

    await app.request
        .put('/api/admin/projects/default/tags')
        .send({
            features: ['duplicate.tag.feature'],
            tags: {
                addedTags: [tag, tag],
                removedTags: [],
            },
        })
        .expect(200);

    const res = await app.request.get(
        '/api/admin/features/duplicate.tag.feature/tags',
    );
    expect(res.body).toMatchObject({ tags: [tag] });
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

test('counts an emoji as one character towards the maximum length', async () => {
    await db.stores.tagStore.createTag({ type: 'simple', value: 'short' });

    const { body } = await app.request
        .post('/api/admin/tags/simple/short/rename')
        .send({ value: '🛸'.repeat(50) })
        .expect(200);

    expect(body.tag.value).toBe('🛸'.repeat(50));
});

test.each([
    ['blank', '   '],
    ['too short', ' a '],
    ['single emoji', '🚀'],
    ['too long', 'a'.repeat(51)],
    ['too long emoji', '🚀'.repeat(51)],
])('rejects renaming a tag to a %s value', async (reason, value) => {
    const tag = { type: 'simple', value: `invalid-${reason}` };
    await db.stores.tagStore.createTag(tag);

    await app.request
        .post(`/api/admin/tags/simple/${encodeURIComponent(tag.value)}/rename`)
        .send({ value })
        .expect(400);

    await app.request
        .get(`/api/admin/tags/simple/${encodeURIComponent(tag.value)}`)
        .expect(200);
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

test.each([
    {
        route: 'POST /api/admin/features/:featureName/tags',
        tagged: false,
        send: (featureName: string, tag: ITag) =>
            app.request
                .post(`/api/admin/features/${featureName}/tags`)
                .send(tag),
    },
    {
        route: 'PUT /api/admin/features/:featureName/tags',
        tagged: false,
        send: (featureName: string, tag: ITag) =>
            app.request
                .put(`/api/admin/features/${featureName}/tags`)
                .send({ addedTags: [tag], removedTags: [] }),
    },
    {
        route: 'DELETE /api/admin/features/:featureName/tags/:type/:value',
        tagged: true,
        send: (featureName: string, tag: ITag) =>
            app.request.delete(
                `/api/admin/features/${featureName}/tags/${tag.type}/${tag.value}`,
            ),
    },
    {
        route: 'PUT /api/admin/projects/:projectId/tags',
        tagged: false,
        send: (featureName: string, tag: ITag) =>
            app.request.put('/api/admin/projects/default/tags').send({
                features: [featureName],
                tags: { addedTags: [tag], removedTags: [] },
            }),
    },
])('does not save a tag change when its event fails to store: $route', async ({
    tagged,
    send,
}) => {
    const featureName = randomId();
    const tag = { type: 'simple', value: randomId() };
    await app.createFeature(featureName);
    await db.stores.tagStore.createTag(tag);
    if (tagged) {
        await db.stores.featureTagStore.tagFeature(featureName, tag, -1337);
    }
    // events.created_by holds 255 characters; a token name has no limit
    const token = await app.services.apiTokenService.createApiTokenWithProjects(
        {
            type: ApiTokenType.ADMIN,
            projects: ['*'],
            environment: '*',
            tokenName: 'x'.repeat(256),
        },
    );

    const res = await send(featureName, tag).set('Authorization', token.secret);

    const { body } = await app.request.get(
        `/api/admin/features/${featureName}/tags`,
    );
    expect(body.tags).toMatchObject(tagged ? [tag] : []);
    expect(res.status).toBe(500);
});

test('saves none of a bulk tag request when a later tag fails', async () => {
    const featureName = 'bulk.tag.rollback.feature';
    await app.createFeature(featureName);

    await app.request
        .put('/api/admin/projects/default/tags')
        .send({
            features: [featureName],
            tags: {
                addedTags: [
                    { type: 'simple', value: 'saved-first' },
                    // tags are written sorted by value, so this one fails after saved-first is created
                    { type: 'no-such-type', value: 'then-failing' },
                ],
                removedTags: [],
            },
        })
        .expect(400);

    await app.request.get('/api/admin/tags/simple/saved-first').expect(404);
});

test('answers 400 when removing a tag whose value has a NUL byte', async () => {
    await app.createFeature('nul.untag.feature');

    await app.request
        .delete('/api/admin/features/nul.untag.feature/tags/simple/a%00b')
        .expect(400);
    await app.request
        .put('/api/admin/projects/default/tags')
        .send({
            features: ['nul.untag.feature'],
            tags: {
                addedTags: [],
                removedTags: [{ type: 'simple', value: 'a\u0000b' }],
            },
        })
        .expect(400);
});

test('does not deadlock two transactions re-adding the flag tags in opposite order', async () => {
    const featureName = 'retag.opposite.order.feature';
    const tagA = { type: 'simple', value: 'retag-a' };
    const tagB = { type: 'simple', value: 'retag-b' };
    await app.createFeature(featureName);
    for (const tag of [tagA, tagB]) {
        await db.stores.tagStore.createTag(tag);
        await db.stores.featureTagStore.tagFeature(featureName, tag, -1337);
    }
    const { transactionalFeatureTagService } = app.services;
    const firstReAdded = Promise.withResolvers<void>();
    const secondReAdded = Promise.withResolvers<void>();
    const reAddTheOther = Promise.withResolvers<void>();

    const first = transactionalFeatureTagService.transactional(
        async (service) => {
            await service.addTag(featureName, tagA, TEST_AUDIT_USER);
            firstReAdded.resolve();
            await reAddTheOther.promise;
            await service.addTag(featureName, tagB, TEST_AUDIT_USER);
        },
    );
    const second = transactionalFeatureTagService.transactional(
        async (service) => {
            await service.addTag(featureName, tagB, TEST_AUDIT_USER);
            secondReAdded.resolve();
            await reAddTheOther.promise;
            await service.addTag(featureName, tagA, TEST_AUDIT_USER);
        },
    );
    await Promise.all([firstReAdded.promise, secondReAdded.promise]);
    reAddTheOther.resolve();

    const results = await Promise.allSettled([first, second]);
    expect(results.map(({ status }) => status)).toEqual([
        'fulfilled',
        'fulfilled',
    ]);
});

test('writes added tags and legacy removals in the same order, whatever order they arrive in', async () => {
    const featureName = 'write.order.feature';
    const [tagA, tagB, tagC, tagD, newTagX, newTagY] = [
        'order-a',
        'order-b',
        'order-c',
        'order-d',
        'order-x',
        'order-y',
    ].map((value) => ({ type: 'simple', value }));
    await db.stores.tagTypeStore.createTagType({ name: 'order-type' });
    const tagAOfOtherType = { type: 'order-type', value: 'order-a' };
    await app.createFeature(featureName);
    for (const tag of [tagA, tagAOfOtherType, tagB, tagC, tagD]) {
        await db.stores.tagStore.createTag(tag);
    }
    for (const tag of [tagC, tagD]) {
        await db.stores.featureTagStore.tagFeature(featureName, tag, -1337);
    }

    await app.request
        .put(`/api/admin/features/${featureName}/tags`)
        .send({
            addedTags: [tagB, tagA, tagAOfOtherType],
            removedTags: [tagD, tagC],
        })
        .expect(200);
    await app.request
        .put('/api/admin/projects/default/tags')
        .send({
            features: [featureName],
            tags: { addedTags: [newTagY, newTagX], removedTags: [] },
        })
        .expect(200);

    const events = (await db.stores.eventStore.getEvents()).toSorted(
        (a, b) => a.id - b.id,
    );
    const tagsOf = (type: string, values: string[]) =>
        events
            .filter((event) => event.type === type)
            .map((event) => event.data ?? event.preData)
            .filter((tag) => values.includes(tag.value))
            .map((tag) => `${tag.type}:${tag.value}`);
    expect(tagsOf('feature-tagged', ['order-a', 'order-b'])).toEqual([
        'order-type:order-a',
        'simple:order-a',
        'simple:order-b',
    ]);
    expect(tagsOf('feature-untagged', ['order-c', 'order-d'])).toEqual([
        'simple:order-c',
        'simple:order-d',
    ]);
    expect(tagsOf('tag-created', ['order-x', 'order-y'])).toEqual([
        'simple:order-x',
        'simple:order-y',
    ]);
});
