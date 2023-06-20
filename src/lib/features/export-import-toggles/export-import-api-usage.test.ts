import { setupAppWithCustomAuth } from '../../../test/e2e/helpers/test-helper';
import dbInit, { ITestDb } from '../../../test/e2e/helpers/database-init';
import getLogger from '../../../test/fixtures/no-logger';
import {
    DEFAULT_PROJECT,
    IContextFieldStore,
    IEnvironmentStore,
    IEventStore,
    IFeatureToggleStore,
    IProjectStore,
    ITagStore,
} from '../../types';
import { DEFAULT_ENV } from '../../util';
import { ImportTogglesSchema, VariantsSchema } from '../../openapi';
import { ApiTokenType } from '../../types/models/api-token';
import { ApiUser } from '../../server-impl';

let db: ITestDb;
let eventStore: IEventStore;
let environmentStore: IEnvironmentStore;
let contextFieldStore: IContextFieldStore;
let projectStore: IProjectStore;
let toggleStore: IFeatureToggleStore;
let tagStore: ITagStore;

beforeAll(async () => {
    db = await dbInit('export_import_api_admin', getLogger);
    eventStore = db.stores.eventStore;
    environmentStore = db.stores.environmentStore;
    projectStore = db.stores.projectStore;
    contextFieldStore = db.stores.contextFieldStore;
    toggleStore = db.stores.featureToggleStore;
    tagStore = db.stores.tagStore;
});

beforeEach(async () => {
    await eventStore.deleteAll();
    await toggleStore.deleteAll();
    await projectStore.deleteAll();
    await environmentStore.deleteAll();
    await tagStore.deleteAll();

    await contextFieldStore.deleteAll();
});

afterAll(async () => {
    await db.destroy();
});

const defaultFeature = 'first_feature';

const variants: VariantsSchema = [
    {
        name: 'variantA',
        weight: 500,
        payload: {
            type: 'string',
            value: 'payloadA',
        },
        overrides: [],
        stickiness: 'default',
        weightType: 'variable',
    },
    {
        name: 'variantB',
        weight: 500,
        payload: {
            type: 'string',
            value: 'payloadB',
        },
        overrides: [],
        stickiness: 'default',
        weightType: 'variable',
    },
];
const exportedFeature: ImportTogglesSchema['data']['features'][0] = {
    project: 'old_project',
    name: 'first_feature',
};
const constraints: ImportTogglesSchema['data']['featureStrategies'][0]['constraints'] =
    [
        {
            values: ['conduit'],
            inverted: false,
            operator: 'IN',
            contextName: 'appName',
            caseInsensitive: false,
        },
    ];
const exportedStrategy: ImportTogglesSchema['data']['featureStrategies'][0] = {
    featureName: defaultFeature,
    id: '798cb25a-2abd-47bd-8a95-40ec13472309',
    name: 'default',
    parameters: {},
    constraints,
};

const tags = [
    {
        featureName: defaultFeature,
        tagType: 'simple',
        tagValue: 'tag1',
    },
    {
        featureName: defaultFeature,
        tagType: 'simple',
        tagValue: 'tag2',
    },
    {
        featureName: defaultFeature,
        tagType: 'special_tag',
        tagValue: 'feature_tagged',
    },
];

const tagTypes = [
    { name: 'bestt', description: 'test' },
    { name: 'special_tag', description: 'this is my special tag' },
    { name: 'special_tag', description: 'this is my special tag' }, // deliberate duplicate
];

const defaultImportPayload: ImportTogglesSchema = {
    data: {
        features: [exportedFeature],
        featureStrategies: [exportedStrategy],
        featureEnvironments: [
            {
                enabled: true,
                environment: 'irrelevant',
                featureName: defaultFeature,
                name: defaultFeature,
                variants,
            },
        ],
        featureTags: tags,
        tagTypes,
        contextFields: [],
        segments: [],
    },
    project: DEFAULT_PROJECT,
    environment: DEFAULT_ENV,
};

test('reject API imports with admin tokens', async () => {
    const preHook = (app: any) => {
        app.use('/api/admin/', async (req, res, next) => {
            const user = new ApiUser({
                permissions: ['ADMIN'],
                environment: '*',
                type: ApiTokenType.ADMIN,
                tokenName: 'tokenName',
                secret: 'secret',
                projects: ['*'],
            });
            req.user = user;
            next();
        });
    };

    const { request, destroy } = await setupAppWithCustomAuth(
        db.stores,
        preHook,
    );

    await request
        .post('/api/admin/features-batch/import')
        .send(defaultImportPayload)
        .expect(400)
        .expect((res) => {
            expect(res.body).toMatchObject({
                message:
                    // it tells the user that they used an admin token
                    expect.stringContaining('admin') &&
                    // it tells the user to use a personal access token
                    expect.stringContaining('personal access token') &&
                    // it tells the user to use a service account
                    expect.stringContaining('service account'),
            });
        });

    await destroy();
});
