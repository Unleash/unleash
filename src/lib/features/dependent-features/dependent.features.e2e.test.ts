import { v4 as uuidv4 } from 'uuid';
import dbInit, { ITestDb } from '../../../test/e2e/helpers/database-init';
import {
    IUnleashTest,
    setupAppWithCustomConfig,
} from '../../../test/e2e/helpers/test-helper';
import getLogger from '../../../test/fixtures/no-logger';
import { CreateDependentFeatureSchema } from '../../openapi';
import {
    FEATURE_DEPENDENCIES_REMOVED,
    FEATURE_DEPENDENCY_ADDED,
    FEATURE_DEPENDENCY_REMOVED,
    IEventStore,
} from '../../types';

let app: IUnleashTest;
let db: ITestDb;
let eventStore: IEventStore;

beforeAll(async () => {
    db = await dbInit('dependent_features', getLogger);
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
    eventStore = db.stores.eventStore;
});

const createProject = async (name: string) => {
    await db.stores.projectStore.create({
        name: name,
        description: '',
        id: name,
        mode: 'open' as const,
    });
};

const getRecordedEventTypesForDependencies = async () =>
    (await eventStore.getEvents())
        .map((event) => event.type)
        .filter((type) => type.includes('depend'));

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

beforeEach(async () => {
    await db.stores.dependentFeaturesStore.deleteAll();
    await db.stores.featureToggleStore.deleteAll();
});

const addFeatureDependency = async (
    childFeature: string,
    payload: CreateDependentFeatureSchema,
    expectedCode = 200,
) => {
    return app.request
        .post(
            `/api/admin/projects/default/features/${childFeature}/dependencies`,
        )
        .send(payload)
        .expect(expectedCode);
};

const deleteFeatureDependency = async (
    childFeature: string,
    parentFeature: string,
    expectedCode = 200,
) => {
    return app.request
        .delete(
            `/api/admin/projects/default/features/${childFeature}/dependencies/${parentFeature}`,
        )
        .expect(expectedCode);
};

const deleteFeatureDependencies = async (
    childFeature: string,
    expectedCode = 200,
) => {
    return app.request
        .delete(
            `/api/admin/projects/default/features/${childFeature}/dependencies`,
        )
        .expect(expectedCode);
};

const getParentOptions = async (childFeature: string, expectedCode = 200) => {
    return app.request
        .get(`/api/admin/projects/default/features/${childFeature}/parents`)
        .expect(expectedCode);
};

const checkDependenciesExist = async (expectedCode = 200) => {
    return app.request
        .get(`/api/admin/projects/default/dependencies`)
        .expect(expectedCode);
};

test('should add and delete feature dependencies', async () => {
    const parent = uuidv4();
    const child = uuidv4();
    await app.createFeature(parent);
    await app.createFeature(child);

    const { body: parentOptions } = await getParentOptions(child);
    expect(parentOptions).toStrictEqual([parent]);

    // save explicit enabled and variants
    await addFeatureDependency(child, {
        feature: parent,
        enabled: false,
    });
    // overwrite with implicit enabled: true and variants
    await addFeatureDependency(child, {
        feature: parent,
        variants: ['variantB'],
    });

    await deleteFeatureDependency(child, parent); // single
    await deleteFeatureDependencies(child); // all

    expect(await getRecordedEventTypesForDependencies()).toStrictEqual([
        FEATURE_DEPENDENCIES_REMOVED,
        FEATURE_DEPENDENCY_REMOVED,
        FEATURE_DEPENDENCY_ADDED,
        FEATURE_DEPENDENCY_ADDED,
    ]);
});

test('should sort parent options alphabetically', async () => {
    const parent1 = `a${uuidv4()}`;
    const parent2 = `c${uuidv4()}`;
    const parent3 = `b${uuidv4()}`;
    const child = uuidv4();
    await app.createFeature(parent1);
    await app.createFeature(parent2);
    await app.createFeature(parent3);
    await app.createFeature(child);

    const { body: parentOptions } = await getParentOptions(child);
    expect(parentOptions).toStrictEqual([parent1, parent3, parent2]);
});

test('should not allow to add grandparent', async () => {
    const grandparent = uuidv4();
    const parent = uuidv4();
    const child = uuidv4();
    await app.createFeature(grandparent);
    await app.createFeature(parent);
    await app.createFeature(child);

    await addFeatureDependency(child, {
        feature: parent,
    });
    await addFeatureDependency(
        parent,
        {
            feature: grandparent,
        },
        403,
    );
});

test('should not allow to add grandchild', async () => {
    const grandparent = uuidv4();
    const parent = uuidv4();
    const child = uuidv4();
    await app.createFeature(grandparent);
    await app.createFeature(parent);
    await app.createFeature(child);

    await addFeatureDependency(parent, {
        feature: grandparent,
    });

    await addFeatureDependency(
        child,
        {
            feature: parent,
        },
        403,
    );
});

test('should not allow to add non-existent parent dependency', async () => {
    const parent = uuidv4();
    const child = uuidv4();
    await app.createFeature(child);

    await addFeatureDependency(
        child,
        {
            feature: parent,
        },
        403,
    );
});

test('should not allow to add archived parent dependency', async () => {
    const parent = uuidv4();
    const child = uuidv4();
    await app.createFeature(child);
    await app.createFeature(parent);
    await app.archiveFeature(parent);

    await addFeatureDependency(
        child,
        {
            feature: parent,
        },
        403,
    );
});

test('should check if any dependencies exist', async () => {
    const parent = uuidv4();
    const child = uuidv4();
    await app.createFeature(child);
    await app.createFeature(parent);

    const { body: dependenciesExistBefore } = await checkDependenciesExist();
    expect(dependenciesExistBefore).toBe(false);

    await addFeatureDependency(child, {
        feature: parent,
    });

    const { body: dependenciesExistAfter } = await checkDependenciesExist();
    expect(dependenciesExistAfter).toBe(true);
});

test('should not allow to add dependency to self', async () => {
    const parent = uuidv4();
    await app.createFeature(parent);

    await addFeatureDependency(
        parent,
        {
            feature: parent,
        },
        403,
    );
});

test('should not allow to add dependency to feature from another project', async () => {
    const child = uuidv4();
    const parent = uuidv4();
    await app.createFeature(parent);
    await createProject('another-project');
    await app.createFeature(child, 'another-project');

    await addFeatureDependency(
        child,
        {
            feature: parent,
        },
        403,
    );
});
