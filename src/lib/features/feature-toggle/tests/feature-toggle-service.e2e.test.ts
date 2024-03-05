import FeatureToggleService from '../feature-toggle-service';
import { createTestConfig } from '../../../../test/config/test-config';
import dbInit, { ITestDb } from '../../../../test/e2e/helpers/database-init';
import { DEFAULT_ENV } from '../../../util';
import { FeatureStrategySchema } from '../../../openapi';
import User from '../../../types/user';
import {
    IConstraint,
    IUnleashConfig,
    IUnleashStores,
    IVariant,
    SKIP_CHANGE_REQUEST,
    SYSTEM_USER,
    SYSTEM_USER_ID,
} from '../../../types';
import EnvironmentService from '../../project-environments/environment-service';
import { ForbiddenError, PatternError, PermissionError } from '../../../error';
import { ISegmentService } from '../../segment/segment-service-interface';
import { createFeatureToggleService, createSegmentService } from '../..';
import {
    insertFeatureEnvironmentsLastSeen,
    insertLastSeenAt,
} from '../../../../test/e2e/helpers/test-helper';
import { EventService } from '../../../services';

let stores: IUnleashStores;
let db: ITestDb;
let service: FeatureToggleService;
let segmentService: ISegmentService;
let eventService: EventService;
let environmentService: EnvironmentService;
let unleashConfig: IUnleashConfig;
const TEST_USER_ID = -9999;
const mockConstraints = (): IConstraint[] => {
    return Array.from({ length: 5 }).map(() => ({
        values: ['x', 'y', 'z'],
        operator: 'IN',
        contextName: 'a',
    }));
};

const irrelevantDate = new Date();

beforeAll(async () => {
    const config = createTestConfig();
    db = await dbInit(
        'feature_toggle_service_v2_service_serial',
        config.getLogger,
    );
    unleashConfig = config;
    stores = db.stores;

    segmentService = createSegmentService(db.rawDatabase, config);

    service = createFeatureToggleService(db.rawDatabase, config);

    eventService = new EventService(stores, config);
});

afterAll(async () => {
    await db.rawDatabase('change_request_settings').del();
    await db.destroy();
});

beforeEach(async () => {
    await db.rawDatabase('change_request_settings').del();
});
test('Should create feature toggle strategy configuration', async () => {
    const projectId = 'default';
    const username = 'feature-toggle';
    const config: Omit<FeatureStrategySchema, 'id'> = {
        name: 'default',
        constraints: [],
        parameters: {},
    };

    await service.createFeatureToggle(
        'default',
        {
            name: 'Demo',
        },
        'test',
        TEST_USER_ID,
    );

    const createdConfig = await service.createStrategy(
        config,
        { projectId, featureName: 'Demo', environment: DEFAULT_ENV },
        username,
    );

    expect(createdConfig.name).toEqual('default');
    expect(createdConfig.id).toBeDefined();
});

test('Should be able to update existing strategy configuration', async () => {
    const projectId = 'default';
    const username = 'existing-strategy';
    const featureName = 'update-existing-strategy';
    const config: Omit<FeatureStrategySchema, 'id'> = {
        name: 'default',
        constraints: [],
        parameters: {},
    };

    await service.createFeatureToggle(
        projectId,
        {
            name: featureName,
        },
        'test',
        TEST_USER_ID,
    );

    const createdConfig = await service.createStrategy(
        config,
        { projectId, featureName, environment: DEFAULT_ENV },
        username,
    );
    expect(createdConfig.name).toEqual('default');
    const updatedConfig = await service.updateStrategy(
        createdConfig.id,
        { parameters: { b2b: 'true' } },
        { projectId, featureName, environment: DEFAULT_ENV },
        username,
    );
    expect(createdConfig.id).toEqual(updatedConfig.id);
    expect(updatedConfig.parameters).toEqual({ b2b: 'true' });
});

test('Should be able to get strategy by id', async () => {
    const featureName = 'get-strategy-by-id';
    const projectId = 'default';

    const userName = 'strategy';
    const config: Omit<FeatureStrategySchema, 'id'> = {
        name: 'default',
        constraints: [],
        variants: [],
        parameters: {},
        title: 'some-title',
    };
    await service.createFeatureToggle(
        projectId,
        {
            name: featureName,
        },
        userName,
        TEST_USER_ID,
    );

    const createdConfig = await service.createStrategy(
        config,
        { projectId, featureName, environment: DEFAULT_ENV },
        userName,
    );
    const fetchedConfig = await service.getStrategy(createdConfig.id);
    expect(fetchedConfig).toEqual(createdConfig);
});

test('should ignore name in the body when updating feature toggle', async () => {
    const featureName = 'body-name-update';
    const projectId = 'default';

    const userName = 'strategy';
    const secondFeatureName = 'body-name-update2';

    await service.createFeatureToggle(
        projectId,
        {
            name: featureName,
            description: 'First toggle',
        },
        userName,
        TEST_USER_ID,
    );

    await service.createFeatureToggle(
        projectId,
        {
            name: secondFeatureName,
            description: 'Second toggle',
        },
        userName,
        TEST_USER_ID,
    );

    const update = {
        name: secondFeatureName,
        description: "I'm changed",
    };

    await service.updateFeatureToggle(
        projectId,
        update,
        userName,
        featureName,
        TEST_USER_ID,
    );
    const featureOne = await service.getFeature({ featureName });
    const featureTwo = await service.getFeature({
        featureName: secondFeatureName,
    });

    expect(featureOne.description).toBe(`I'm changed`);
    expect(featureTwo.description).toBe('Second toggle');
});

test('should not get empty rows as features', async () => {
    const projectId = 'default';

    const userName = 'strategy';

    await service.createFeatureToggle(
        projectId,
        {
            name: 'linked-with-segment',
            description: 'First toggle',
        },
        userName,
        TEST_USER_ID,
    );

    await service.createFeatureToggle(
        projectId,
        {
            name: 'not-linked-with-segment',
            description: 'Second toggle',
        },
        userName,
        TEST_USER_ID,
    );

    const user = { email: 'test@example.com' } as User;
    const postData = {
        name: 'Unlinked segment',
        constraints: mockConstraints(),
    };
    await segmentService.create(postData, user);

    const features = await service.getClientFeatures();
    const namelessFeature = features.find((p) => !p.name);

    expect(features.length).toBe(7);
    expect(namelessFeature).toBeUndefined();
});

test('adding and removing an environment preserves variants when variants per env is off', async () => {
    const featureName = 'something-that-has-variants';
    const prodEnv = 'mock-prod-env';

    await stores.environmentStore.create({
        name: prodEnv,
        type: 'production',
    });

    await service.createFeatureToggle(
        'default',
        {
            name: featureName,
            description: 'Second toggle',
            variants: [
                {
                    name: 'variant1',
                    weight: 100,
                    weightType: 'fix',
                    stickiness: 'default',
                },
            ],
        },
        'random_user',
        TEST_USER_ID,
    );

    //force the variantEnvironments flag off so that we can test legacy behavior
    environmentService = new EnvironmentService(
        stores,
        {
            ...unleashConfig,
            // @ts-expect-error - incomplete flag resolver definition
            flagResolver: {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                isEnabled: (toggleName: string) => false,
            },
        },
        eventService,
    );

    await environmentService.addEnvironmentToProject(
        prodEnv,
        'default',
        SYSTEM_USER.username,
        SYSTEM_USER.id,
    );
    await environmentService.removeEnvironmentFromProject(
        prodEnv,
        'default',
        SYSTEM_USER.username,
        SYSTEM_USER.id,
    );
    await environmentService.addEnvironmentToProject(
        prodEnv,
        'default',
        SYSTEM_USER.username,
        SYSTEM_USER.id,
    );

    const toggle = await service.getFeature({
        featureName,
        projectId: undefined,
        environmentVariants: false,
    });
    expect(toggle.variants).toHaveLength(1);
});

test('cloning a feature toggle copies variant environments correctly', async () => {
    const newToggleName = 'Molly';
    const clonedToggleName = 'Dolly';
    const targetEnv = 'gene-lab';

    await service.createFeatureToggle(
        'default',
        {
            name: newToggleName,
        },
        'test',
        TEST_USER_ID,
    );

    await stores.environmentStore.create({
        name: 'gene-lab',
        type: 'production',
    });

    await stores.featureEnvironmentStore.connectFeatureToEnvironmentsForProject(
        newToggleName,
        'default',
    );

    await stores.featureEnvironmentStore.addVariantsToFeatureEnvironment(
        newToggleName,
        targetEnv,
        [
            {
                name: 'variant1',
                weight: 100,
                weightType: 'fix',
                stickiness: 'default',
            },
        ],
    );

    await service.cloneFeatureToggle(
        newToggleName,
        'default',
        clonedToggleName,
        'test-user',
        SYSTEM_USER_ID,
        true,
    );

    const clonedToggle =
        await stores.featureStrategiesStore.getFeatureToggleWithVariantEnvs(
            clonedToggleName,
        );

    const defaultEnv = clonedToggle.environments.find(
        (x) => x.name === 'default',
    );
    const newEnv = clonedToggle.environments.find((x) => x.name === targetEnv);

    expect(defaultEnv!!.variants).toHaveLength(0);
    expect(newEnv!!.variants).toHaveLength(1);
});

test('cloning a feature toggle not allowed for change requests enabled', async () => {
    await db.rawDatabase('change_request_settings').insert({
        project: 'default',
        environment: 'default',
    });
    await expect(
        service.cloneFeatureToggle(
            'newToggleName',
            'default',
            'clonedToggleName',
            'test-user',
            SYSTEM_USER_ID,
            true,
        ),
    ).rejects.toEqual(
        new ForbiddenError(
            `Cloning not allowed. Project default has change requests enabled.`,
        ),
    );
});

test('changing to a project with change requests enabled should not be allowed', async () => {
    await db.rawDatabase('change_request_settings').insert({
        project: 'default',
        environment: 'default',
    });
    await expect(
        service.changeProject('newToggleName', 'default', 'user', TEST_USER_ID),
    ).rejects.toEqual(
        new ForbiddenError(
            `Changing project not allowed. Project default has change requests enabled.`,
        ),
    );
});

test('Cloning a feature toggle also clones segments correctly', async () => {
    const featureName = 'ToggleWithSegments';
    const clonedFeatureName = 'AWholeNewFeatureToggle';

    const segment = await segmentService.create(
        {
            name: 'SomeSegment',
            constraints: mockConstraints(),
        },
        {
            email: 'test@example.com',
        },
    );

    await service.createFeatureToggle(
        'default',
        {
            name: featureName,
        },
        'test-user',
        TEST_USER_ID,
    );

    const config: Omit<FeatureStrategySchema, 'id'> = {
        name: 'default',
        constraints: [],
        parameters: {},
        segments: [segment.id],
    };

    await service.createStrategy(
        config,
        { projectId: 'default', featureName, environment: DEFAULT_ENV },
        'test-user',
    );

    await service.cloneFeatureToggle(
        featureName,
        'default',
        clonedFeatureName,
        'test-user',
        SYSTEM_USER_ID,
        true,
    );

    const feature = await service.getFeature({
        featureName: clonedFeatureName,
    });
    expect(
        feature.environments.find((x) => x.name === 'default')?.strategies[0]
            .segments,
    ).toHaveLength(1);
});

test('If change requests are enabled, cannot change variants without going via CR', async () => {
    const featureName = 'feature-with-variants-per-env-and-cr';
    await service.createFeatureToggle(
        'default',
        { name: featureName },
        'test-user',
        TEST_USER_ID,
    );

    // Force all feature flags on to make sure we have Change requests on
    const customFeatureService = createFeatureToggleService(db.rawDatabase, {
        ...unleashConfig,
        // @ts-expect-error - incomplete flag resolver definition
        flagResolver: {
            isEnabled: () => true,
        },
    });

    const newVariant: IVariant = {
        name: 'cr-enabled',
        weight: 100,
        weightType: 'variable',
        stickiness: 'default',
    };
    await db.rawDatabase('change_request_settings').insert({
        project: 'default',
        environment: 'default',
    });
    return expect(async () =>
        customFeatureService.crProtectedSaveVariantsOnEnv(
            'default',
            featureName,
            'default',
            [newVariant],
            {
                createdAt: irrelevantDate,
                email: '',
                id: 0,
                imageUrl: '',
                loginAttempts: 0,
                name: '',
                permissions: [],
                seenAt: irrelevantDate,
                username: '',
                isAPI: true,
            },
            [],
        ),
    ).rejects.toThrowError(new PermissionError(SKIP_CHANGE_REQUEST));
});

test('If CRs are protected for any environment in the project stops bulk update of variants', async () => {
    const user = { email: 'test@example.com', username: 'test-user' } as User;
    const project = await stores.projectStore.create({
        id: 'crOnVariantsProject',
        name: 'crOnVariantsProject',
    });
    const enabledEnv = await stores.environmentStore.create({
        name: 'crenabledenv',
        type: 'production',
    });
    const disabledEnv = await stores.environmentStore.create({
        name: 'crdisabledenv',
        type: 'production',
    });

    await stores.projectStore.addEnvironmentToProject(
        project.id,
        enabledEnv.name,
    );
    await stores.projectStore.addEnvironmentToProject(
        project.id,
        disabledEnv.name,
    );

    // Force all feature flags on to make sure we have Change requests on
    const customFeatureService = createFeatureToggleService(db.rawDatabase, {
        ...unleashConfig,
        // @ts-expect-error - incomplete flag resolver definition
        flagResolver: {
            isEnabled: () => true,
        },
    });

    const toggle = await service.createFeatureToggle(
        project.id,
        { name: 'crOnVariantToggle' },
        user.username,
        user.id,
    );

    const variant: IVariant = {
        name: 'cr-enabled',
        weight: 100,
        weightType: 'variable',
        stickiness: 'default',
    };
    await db.rawDatabase('change_request_settings').insert({
        project: project.id,
        environment: enabledEnv.name,
    });

    await customFeatureService.setVariantsOnEnvs(
        project.id,
        toggle.name,
        [enabledEnv.name, disabledEnv.name],
        [variant],
        user,
    );

    const newVariants = [
        { ...variant, weight: 500 },
        {
            name: 'cr-enabled-2',
            weight: 500,
            weightType: 'fix' as const,
            stickiness: 'default',
        },
    ];
    return expect(async () =>
        customFeatureService.crProtectedSetVariantsOnEnvs(
            project.id,
            toggle.name,
            [enabledEnv.name, disabledEnv.name],
            newVariants,
            {
                createdAt: irrelevantDate,
                email: '',
                id: 0,
                imageUrl: '',
                loginAttempts: 0,
                name: '',
                permissions: [],
                seenAt: irrelevantDate,
                username: '',
                isAPI: true,
            },
        ),
    ).rejects.toThrowError(new PermissionError(SKIP_CHANGE_REQUEST));
});

test('getPlaygroundFeatures should return ids and titles (if they exist) on client strategies', async () => {
    const featureName = 'check-returned-strategy-configuration';
    const projectId = 'default';

    const title = 'custom strategy title';
    const userName = 'strategy';
    const config: Omit<FeatureStrategySchema, 'id'> = {
        name: 'default',
        constraints: [],
        parameters: {},
        title,
    };
    await service.createFeatureToggle(
        projectId,
        {
            name: featureName,
        },
        userName,
        TEST_USER_ID,
    );

    await service.createStrategy(
        config,
        { projectId, featureName, environment: DEFAULT_ENV },
        userName,
    );

    const playgroundFeatures = await service.getPlaygroundFeatures();

    const strategyWithTitle = playgroundFeatures.find(
        (feature) => feature.name === featureName,
    )!.strategies[0];

    expect(strategyWithTitle.title).toStrictEqual(title);

    for (const strategy of playgroundFeatures.flatMap(
        (feature) => feature.strategies,
    )) {
        expect(strategy.id).not.toBeUndefined();
    }
});

describe('flag name validation', () => {
    test('should validate feature names if the project has flag name pattern', async () => {
        const projectId = 'pattern-validation';
        const featureNaming = {
            pattern: 'testpattern.+',
            example: 'testpattern-one!',
            description: 'naming description',
        };
        const project = {
            id: projectId,
            name: projectId,
            mode: 'open' as const,
            defaultStickiness: 'default',
        };

        await stores.projectStore.create(project);
        await stores.projectStore.updateProjectEnterpriseSettings({
            id: projectId,
            featureNaming,
        });

        const validFeatures = ['testpattern-feature', 'testpattern-feature2'];
        const invalidFeatures = ['a', 'b', 'c'];

        for (const feature of invalidFeatures) {
            await expect(
                service.validateFeatureFlagNameAgainstPattern(
                    feature,
                    projectId,
                ),
            ).rejects.toBeInstanceOf(PatternError);
        }

        for (const feature of validFeatures) {
            await expect(
                service.validateFeatureFlagNameAgainstPattern(
                    feature,
                    projectId,
                ),
            ).resolves.toBeFalsy();
        }
    });

    test("should allow anything if the project doesn't exist", async () => {
        const projectId = 'project-that-doesnt-exist';
        const validFeatures = ['testpattern-feature', 'testpattern-feature2'];

        for (const feature of validFeatures) {
            await expect(
                service.validateFeatureFlagNameAgainstPattern(
                    feature,
                    projectId,
                ),
            ).resolves.toBeFalsy();
        }
    });
});

test('Should return last seen at per environment', async () => {
    const featureName = 'last-seen-at-per-env';
    const projectId = 'default';

    const userName = 'last-seen-user';

    await service.createFeatureToggle(
        projectId,
        {
            name: featureName,
        },
        userName,
        TEST_USER_ID,
    );

    const date = await insertFeatureEnvironmentsLastSeen(
        featureName,
        db.rawDatabase,
    );

    const { environments, lastSeenAt } = await service.getFeature({
        featureName,
        projectId: 'default',
        environmentVariants: false,
    });

    expect(environments[0].lastSeenAt).toEqual(new Date(date));
    expect(lastSeenAt).toEqual(new Date(date));

    // Test with feature flag on
    const config = createTestConfig();

    const featureService = createFeatureToggleService(db.rawDatabase, config);

    const lastSeenAtStoreDate = await insertLastSeenAt(
        featureName,
        db.rawDatabase,
    );

    const featureToggle = await featureService.getFeature({
        featureName,
        projectId: 'default',
        environmentVariants: false,
    });

    expect(featureToggle.environments[0].lastSeenAt).toEqual(
        new Date(lastSeenAtStoreDate),
    );
    expect(featureToggle.lastSeenAt).toEqual(new Date(lastSeenAtStoreDate));
});
