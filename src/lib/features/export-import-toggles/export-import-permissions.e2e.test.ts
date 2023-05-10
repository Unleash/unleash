import {
    IUnleashTest,
    setupAppWithAuth,
} from '../../../test/e2e/helpers/test-helper';
import dbInit, { ITestDb } from '../../../test/e2e/helpers/database-init';
import getLogger from '../../../test/fixtures/no-logger';
import {
    DEFAULT_PROJECT,
    IContextFieldStore,
    IEnvironmentStore,
    IEventStore,
    IFeatureToggleStore,
    IProjectStore,
    IUnleashStores,
    RoleName,
} from '../../types';
import { ImportTogglesSchema, VariantsSchema } from '../../openapi';
import { IContextFieldDto } from '../../types/stores/context-field-store';
import { AccessService } from '../../services';
import { DEFAULT_ENV } from '../../util';

let app: IUnleashTest;
let db: ITestDb;
let eventStore: IEventStore;
let environmentStore: IEnvironmentStore;
let contextFieldStore: IContextFieldStore;
let projectStore: IProjectStore;
let toggleStore: IFeatureToggleStore;
let accessService: AccessService;
let adminRole;
let stores: IUnleashStores;

const regularUserName = 'import-user';
const adminUserName = 'admin-user';

const validateImport = (importPayload: ImportTogglesSchema, status = 200) =>
    app.request
        .post('/api/admin/features-batch/validate')
        .send(importPayload)
        .set('Content-Type', 'application/json')
        .expect(status);

const createContextField = async (contextField: IContextFieldDto) => {
    await app.request.post(`/api/admin/context`).send(contextField).expect(201);
};

const createFeature = async (featureName: string) => {
    await app.request
        .post(`/api/admin/projects/${DEFAULT_PROJECT}/features`)
        .send({
            name: featureName,
        })
        .set('Content-Type', 'application/json')
        .expect(201);
};

const createFeatureToggleWithStrategy = async (featureName: string) => {
    await createFeature(featureName);
    return app.request
        .post(
            `/api/admin/projects/${DEFAULT_PROJECT}/features/${featureName}/environments/${DEFAULT_ENV}/strategies`,
        )
        .send({
            name: 'default',
            parameters: {
                userId: 'string',
            },
        })
        .expect(200);
};

const archiveFeature = async (featureName: string) => {
    await app.request
        .delete(
            `/api/admin/projects/${DEFAULT_PROJECT}/features/${featureName}`,
        )
        .set('Content-Type', 'application/json')
        .expect(202);
};

const createProject = async () => {
    await db.stores.environmentStore.create({
        name: DEFAULT_ENV,
        type: 'production',
    });
    await db.stores.projectStore.create({
        name: DEFAULT_PROJECT,
        description: '',
        id: DEFAULT_PROJECT,
        mode: 'open' as const,
    });
};

const newFeature = 'new_feature';
const archivedFeature = 'archived_feature';
const existingFeature = 'existing_feature';

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
const feature1: ImportTogglesSchema['data']['features'][0] = {
    project: 'old_project',
    name: archivedFeature,
};

const feature2: ImportTogglesSchema['data']['features'][0] = {
    project: 'old_project',
    name: newFeature,
};

const feature3: ImportTogglesSchema['data']['features'][0] = {
    project: 'old_project',
    name: existingFeature,
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
    featureName: newFeature,
    id: '798cb25a-2abd-47bd-8a95-40ec13472309',
    name: 'default',
    parameters: {},
    constraints,
};

const tags = [
    {
        featureName: newFeature,
        tagType: 'simple',
        tagValue: 'tag1',
    },
    {
        featureName: newFeature,
        tagType: 'simple',
        tagValue: 'tag2',
    },
    {
        featureName: newFeature,
        tagType: 'special_tag',
        tagValue: 'feature_tagged',
    },
];

const tagTypes = [
    { name: 'bestt', description: 'test' },
    { name: 'special_tag', description: 'this is my special tag' },
    { name: 'special_tag', description: 'this is my special tag' }, // deliberate duplicate
];

const importPayload: ImportTogglesSchema = {
    data: {
        features: [feature1, feature2, feature3],
        featureStrategies: [exportedStrategy],
        featureEnvironments: [
            {
                enabled: true,
                environment: 'irrelevant',
                featureName: newFeature,
                name: newFeature,
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

const createUserEditorAccess = async (name, email) => {
    const { userStore } = stores;
    const user = await userStore.insert({ name, email });
    return user;
};

const createUserAdminAccess = async (name, email) => {
    const { userStore } = stores;
    const user = await userStore.insert({ name, email });
    await accessService.addUserToRole(user.id, adminRole.id, 'default');
    return user;
};

const loginRegularUser = () =>
    app.request
        .post(`/auth/demo/login`)
        .send({
            email: `${regularUserName}@getunleash.io`,
        })
        .expect(200);

const loginAdminUser = () =>
    app.request
        .post(`/auth/demo/login`)
        .send({
            email: `${adminUserName}@getunleash.io`,
        })
        .expect(200);

beforeAll(async () => {
    db = await dbInit('export_import_permissions_api_serial', getLogger);
    stores = db.stores;
    app = await setupAppWithAuth(
        db.stores,
        {
            experimental: {
                flags: {
                    featuresExportImport: true,
                },
            },
        },
        db.rawDatabase,
    );
    eventStore = db.stores.eventStore;
    environmentStore = db.stores.environmentStore;
    projectStore = db.stores.projectStore;
    toggleStore = db.stores.featureToggleStore;
    accessService = app.services.accessService;
    contextFieldStore = db.stores.contextFieldStore;

    const roles = await accessService.getRootRoles();
    adminRole = roles.find((role) => role.name === RoleName.ADMIN);

    await createUserEditorAccess(
        regularUserName,
        `${regularUserName}@getunleash.io`,
    );
    await createUserAdminAccess(
        adminUserName,
        `${adminUserName}@getunleash.io`,
    );
});

beforeEach(async () => {
    await eventStore.deleteAll();
    await toggleStore.deleteAll();
    await projectStore.deleteAll();
    await environmentStore.deleteAll();
    await contextFieldStore.deleteAll();

    await contextFieldStore.deleteAll();
    await loginAdminUser();
    await createContextField({ name: 'appName' });
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('validate import data', async () => {
    await loginAdminUser();
    await createProject();
    const contextField: IContextFieldDto = {
        name: 'validate_context_field',
        legalValues: [{ value: 'Value1' }],
    };

    const createdContextField: IContextFieldDto = {
        name: 'created_context_field',
        legalValues: [{ value: 'new_value' }],
    };

    await createFeature(archivedFeature);
    await archiveFeature(archivedFeature);

    await createFeatureToggleWithStrategy(existingFeature);

    await createContextField(contextField);
    const importPayloadWithContextFields: ImportTogglesSchema = {
        ...importPayload,
        data: {
            ...importPayload.data,
            featureStrategies: [{ name: 'customStrategy' }],
            segments: [{ id: 1, name: 'customSegment' }],
            contextFields: [
                {
                    ...contextField,
                    legalValues: [{ value: 'Value2' }],
                },
                createdContextField,
            ],
        },
    };

    await loginRegularUser();

    const { body } = await validateImport(importPayloadWithContextFields, 200);

    expect(body).toMatchObject({
        errors: [
            {
                message:
                    'We detected the following custom strategy in the import file that needs to be created first:',
                affectedItems: ['customStrategy'],
            },
            {
                message:
                    'We detected the following context fields that do not have matching legal values with the imported ones:',
                affectedItems: [contextField.name],
            },
        ],
        warnings: [
            {
                message:
                    'The following features will not be imported as they are currently archived. To import them, please unarchive them first:',
                affectedItems: [archivedFeature],
            },
        ],
        permissions: [
            {
                message:
                    'We detected you are missing the following permissions:',
                affectedItems: [
                    'Create feature toggles',
                    'Update feature toggles',
                    'Update tag types',
                    'Create context fields',
                    'Create activation strategies',
                    'Delete activation strategies',
                    'Update variants',
                ],
            },
        ],
    });
});
