import { setupApp } from '../../helpers/test-helper';
import dbInit from '../../helpers/database-init';
import getLogger from '../../../fixtures/no-logger';
import SwaggerParser from '@apidevtools/swagger-parser';
import enforcer from 'openapi-enforcer';
import semver from 'semver';
import { openApiTags } from '../../../../lib/openapi/util/openapi-tags';

let app;
let db;

beforeAll(async () => {
    db = await dbInit('openapi', getLogger);
    app = await setupApp(db.stores);
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('should serve the OpenAPI UI', async () => {
    return app.request
        .get('/docs/openapi/')
        .expect('Content-Type', /html/)
        .expect(200)
        .expect((res) => expect(res.text).toMatchSnapshot());
});

test('should serve the OpenAPI spec', async () => {
    return app.request
        .get('/docs/openapi.json')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            // Don't use the version field in snapshot tests. Having the version
            // listed in automated testing causes issues when trying to deploy
            // new versions of the API (due to mismatch between new tag versions etc).
            delete res.body.info.version;

            // This test will fail whenever there's a change to the API spec.
            // If the change is intended, update the snapshot with `jest -u`.
            expect(res.body).toMatchSnapshot();
        });
});

test('should serve the OpenAPI spec with a `version` property', async () => {
    return app.request
        .get('/docs/openapi.json')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            const { version } = res.body.info;
            // ensure there's no whitespace or leading `v`
            expect(semver.clean(version)).toStrictEqual(version);

            // ensure the version listed is valid semver
            expect(semver.parse(version, { loose: false })).toBeTruthy();
        });
});

test('the generated OpenAPI spec is valid', async () => {
    const { body } = await app.request
        .get('/docs/openapi.json')
        .expect('Content-Type', /json/)
        .expect(200);

    // this throws if the swagger parser can't parse it correctly
    // also parses examples, but _does_ do some string coercion in examples
    try {
        await SwaggerParser.validate(body);
    } catch (err) {
        console.error(err);
        // there's an error here, so let's exit after showing it in the console.
        expect(true).toBe(false);
    }

    const [, enforcerError, enforcerWarning] = await enforcer(body, {
        fullResult: true,
        componentOptions: {
            exceptionSkipCodes: [
                // allow non-standard formats for strings (including 'uri')
                'WSCH001',

                // Schemas with an indeterminable type cannot serialize,
                // deserialize, or validate values. [WSCH005]
                //
                // This allows specifying the 'any' type for schemas (such as the
                // patchSchema)
                'WSCH005',
            ],
        },
    });

    if (enforcerWarning !== undefined) {
        console.warn(enforcerWarning);
    }
    if (enforcerError !== undefined) {
        console.error(enforcerError);
    }

    expect(enforcerWarning ?? enforcerError).toBe(undefined);
});

test('all root-level tags are "approved tags"', async () => {
    const { body: spec } = await app.request
        .get('/docs/openapi.json')
        .expect('Content-Type', /json/)
        .expect(200);

    const specTags = spec.tags;
    const approvedTags = openApiTags;

    // expect spec tags to be a subset of the approved tags
    expect(approvedTags).toEqual(expect.arrayContaining(specTags));
});
// All tags that are used for OpenAPI path operations must also be listed in the
// OpenAPI root-level tags list. For us, there's two immediate things that make
// this important:
//
// 1. Swagger UI groups operations by tags. To make sure that endpoints are
// listed where users would expect to find them, they should be given an
// appropriate tag.
//
// 2. The OpenAPI/docusaurus integration we use does not generate documentation
// for paths whose tags are not listed in the root-level tags list.
//
// If none of the official tags seem appropriate for an endpoint, consider
// creating a new tag.
test('all tags are listed in the root "tags" list', async () => {
    const { body: spec } = await app.request
        .get('/docs/openapi.json')
        .expect('Content-Type', /json/)
        .expect(200);

    const rootLevelTagNames = new Set(spec.tags.map((tag) => tag.name));

    // dictionary of all invalid tags found in the spec
    let invalidTags = {};
    for (const [path, data] of Object.entries(spec.paths)) {
        for (const [operation, opData] of Object.entries(data)) {
            // ensure that the list of tags for every operation is a subset of
            // the list of tags defined on the root level

            // check each tag for this operation
            for (const tag of opData.tags) {
                if (!rootLevelTagNames.has(tag)) {
                    // store other invalid tags that already exist on this
                    // operation
                    const preExistingTags =
                        (invalidTags[path] ?? {})[operation]?.invalidTags ?? [];

                    // add information about the invalid tag to the invalid tags
                    // dict.
                    invalidTags = {
                        ...invalidTags,
                        [path]: {
                            ...invalidTags[path],
                            [operation]: {
                                operationId: opData.operationId,
                                invalidTags: [...preExistingTags, tag],
                            },
                        },
                    };
                }
            }
        }
    }

    if (Object.keys(invalidTags).length) {
        // create a human-readable list of invalid tags per operation
        const msgs = Object.entries(invalidTags).flatMap(([path, data]) =>
            Object.entries(data).map(
                ([operation, opData]) =>
                    `${operation.toUpperCase()} ${path} (operation id: ${
                        opData.operationId
                    }) has the following invalid tags: ${opData.invalidTags
                        .map((tag) => `"${tag}"`)
                        .join(', ')}`,
            ),
        );

        // format message
        const errorMessage = `The OpenAPI spec contains path-level tags that are not listed in the root-level tags object. The relevant paths, operation ids, and tags are as follows:\n\n${msgs.join(
            '\n\n',
        )}\n\nFor reference, the root-level tags are: ${spec.tags
            .map((tag) => `"${tag.name}"`)
            .join(', ')}`;

        console.error(errorMessage);
    }
    expect(invalidTags).toStrictEqual({});
});
