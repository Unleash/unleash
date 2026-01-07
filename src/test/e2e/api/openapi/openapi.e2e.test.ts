import {
    type IUnleashTest,
    setupApp,
    setupAppWithBaseUrl,
} from '../../helpers/test-helper.js';
import dbInit, { type ITestDb } from '../../helpers/database-init.js';
import getLogger from '../../../fixtures/no-logger.js';
import SwaggerParser from '@apidevtools/swagger-parser';
import enforcer from 'openapi-enforcer';
import semver from 'semver';
import { openApiTags } from '../../../../lib/openapi/index.js';

let app: IUnleashTest;
let db: ITestDb;

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
        .expect(200);
});

test('should serve the OpenAPI spec', async () => {
    return app.request
        .get('/docs/openapi.json')
        .expect('Content-Type', /json/)
        .expect(200);
});

test('should serve the OpenAPI spec with a `version` property', async () => {
    return app.request
        .get('/docs/openapi.json')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            const { version } = res.body.info;
            // ensure there's no whitespace or leading `v`
            // clean removes +anything modifier from the version
            expect(version).toMatch(
                new RegExp(`^${semver.clean(version) ?? 'invalid semver'}`),
            );

            // ensure the version listed is valid semver
            expect(semver.parse(version, { loose: false })).toBeTruthy();
        });
});

describe('subpath handling', () => {
    let appWithSubPath: IUnleashTest;
    const subPath = '/absolute-nonsense';

    beforeAll(async () => {
        appWithSubPath = await setupAppWithBaseUrl(db.stores, subPath);
    });

    afterAll(async () => {
        await appWithSubPath?.destroy();
    });

    test('the OpenAPI spec has the base path appended to its server', async () => {
        const {
            body: { servers },
        } = await appWithSubPath.request
            .get(`${subPath}/docs/openapi.json`)
            .expect('Content-Type', /json/)
            .expect(200);

        expect(servers[0].url).toMatch(new RegExp(`.+${subPath}$`));
    });

    test('When the server has a base path, that base path is stripped from the endpoints', async () => {
        const {
            body: { paths },
        } = await appWithSubPath.request
            .get(`${subPath}/docs/openapi.json`)
            .expect('Content-Type', /json/)
            .expect(200);

        // ensure that paths on this server don't start with the base
        // uri path.
        const noPathsStartWithSubpath = Object.keys(paths).every(
            (p) => !p.startsWith(subPath),
        );

        expect(noPathsStartWithSubpath).toBe(true);
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

    const enforcerResults = {
        warnings: enforcerWarning?.toString(),
        errors: enforcerError?.toString(),
    };

    expect(enforcerResults).toMatchObject({
        warnings: undefined,
        errors: undefined,
    });
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
        for (const [operation, opData] of Object.entries(data!)) {
            // ensure that the list of tags for every operation is a subset of
            // the list of tags defined on the root level

            // check each tag for this operation
            for (const tag of opData.tags) {
                if (!rootLevelTagNames.has(tag)) {
                    // store other invalid tags that already exist on this
                    // operation
                    const preExistingTags =
                        invalidTags[path]?.[operation]?.invalidTags ?? [];
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
            Object.entries(data!).map(
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

test('all API operations have non-empty summaries and descriptions', async () => {
    const { body: spec } = await app.request
        .get('/docs/openapi.json')
        .expect('Content-Type', /json/)
        .expect(200);

    const anomalies = Object.entries(spec.paths).flatMap(([path, data]) => {
        return Object.entries(data!)
            .map(([verb, operationDescription]) => {
                if (
                    operationDescription.summary &&
                    operationDescription.description
                ) {
                    return undefined;
                } else {
                    return [verb, operationDescription.operationId];
                }
            })
            .filter(Boolean)
            .map(
                // @ts-expect-error - requesting an iterator where none could be found
                ([verb, operationId]) =>
                    `${verb.toUpperCase()} ${path} (operation ID: ${operationId})`,
            );
    });

    // any items left in the anomalies list is missing either a summary, or a
    // description, or both.
    expect(anomalies).toStrictEqual([]);
});
