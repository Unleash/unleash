import FeatureToggleService from '../../../lib/services/feature-toggle-service';
import { createTestConfig } from '../../config/test-config';
import dbInit from '../helpers/database-init';
import { DEFAULT_ENV } from '../../../lib/util';
import {
    AccessService,
    GroupService,
    SegmentService,
} from '../../../lib/services';
import { FeatureStrategySchema } from '../../../lib/openapi';
import User from '../../../lib/types/user';
import { IConstraint, IVariant, SKIP_CHANGE_REQUEST } from '../../../lib/types';
import EnvironmentService from '../../../lib/services/environment-service';
import { NoAccessError } from '../../../lib/error';
import { ISegmentService } from '../../../lib/segments/segment-service-interface';
import { ChangeRequestAccessReadModel } from '../../../lib/features/change-request-access-service/sql-change-request-access-read-model';

let stores;
let db;
let service: FeatureToggleService;
let segmentService: ISegmentService;
let environmentService: EnvironmentService;
let unleashConfig;

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
    segmentService = new SegmentService(stores, config);
    const groupService = new GroupService(stores, config);
    const accessService = new AccessService(stores, config, groupService);
    const changeRequestAccessReadModel = new ChangeRequestAccessReadModel(
        db.rawDatabase,
        accessService,
    );
    service = new FeatureToggleService(
        stores,
        config,
        segmentService,
        accessService,
        changeRequestAccessReadModel,
    );
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
        parameters: {},
        title: 'some-title',
    };
    await service.createFeatureToggle(
        projectId,
        {
            name: featureName,
        },
        userName,
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
    );

    await service.createFeatureToggle(
        projectId,
        {
            name: secondFeatureName,
            description: 'Second toggle',
        },
        userName,
    );

    const update = {
        name: secondFeatureName,
        description: "I'm changed",
    };

    await service.updateFeatureToggle(projectId, update, userName, featureName);
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
    );

    await service.createFeatureToggle(
        projectId,
        {
            name: 'not-linked-with-segment',
            description: 'Second toggle',
        },
        userName,
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
    );

    //force the variantEnvironments flag off so that we can test legacy behavior
    environmentService = new EnvironmentService(stores, {
        ...unleashConfig,
        flagResolver: {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            isEnabled: (toggleName: string) => false,
        },
    });

    await environmentService.addEnvironmentToProject(prodEnv, 'default');
    await environmentService.removeEnvironmentFromProject(prodEnv, 'default');
    await environmentService.addEnvironmentToProject(prodEnv, 'default');

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
        true,
        'test-user',
    );

    const clonedToggle =
        await stores.featureStrategiesStore.getFeatureToggleWithVariantEnvs(
            clonedToggleName,
        );

    const defaultEnv = clonedToggle.environments.find(
        (x) => x.name === 'default',
    );
    const newEnv = clonedToggle.environments.find((x) => x.name === targetEnv);

    expect(defaultEnv.variants).toHaveLength(0);
    expect(newEnv.variants).toHaveLength(1);
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
            true,
            'test-user',
        ),
    ).rejects.toEqual(
        new NoAccessError(
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
        service.changeProject('newToggleName', 'default', 'user'),
    ).rejects.toEqual(
        new NoAccessError(
            `Changing project not allowed. Project default has change requests enabled.`,
        ),
    );
});

test('Cloning a feature toggle also clones segments correctly', async () => {
    const featureName = 'ToggleWithSegments';
    const clonedFeatureName = 'AWholeNewFeatureToggle';

    let segment = await segmentService.create(
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
        true,
        'test-user',
    );

    let feature = await service.getFeature({ featureName: clonedFeatureName });
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
    );
    const groupService = new GroupService(stores, unleashConfig);
    const accessService = new AccessService(
        stores,
        unleashConfig,
        groupService,
    );
    const changeRequestAccessReadModel = new ChangeRequestAccessReadModel(
        db.rawDatabase,
        accessService,
    );
    // Force all feature flags on to make sure we have Change requests on
    const customFeatureService = new FeatureToggleService(
        stores,
        {
            ...unleashConfig,
            flagResolver: {
                isEnabled: () => true,
            },
        },
        segmentService,
        accessService,
        changeRequestAccessReadModel,
    );

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
                generateImageUrl(): string {
                    return '';
                },
                isAPI: true,
            },
            [],
        ),
    ).rejects.toThrowError(new NoAccessError(SKIP_CHANGE_REQUEST));
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
    const groupService = new GroupService(stores, unleashConfig);
    const accessService = new AccessService(
        stores,
        unleashConfig,
        groupService,
    );
    const changeRequestAccessReadModel = new ChangeRequestAccessReadModel(
        db.rawDatabase,
        accessService,
    );
    // Force all feature flags on to make sure we have Change requests on
    const customFeatureService = new FeatureToggleService(
        stores,
        {
            ...unleashConfig,
            flagResolver: {
                isEnabled: () => true,
            },
        },
        segmentService,
        accessService,
        changeRequestAccessReadModel,
    );

    const toggle = await service.createFeatureToggle(
        project.id,
        { name: 'crOnVariantToggle' },
        user.username,
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
            weightType: 'fix',
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
                generateImageUrl(): string {
                    return '';
                },
                isAPI: true,
            },
        ),
    ).rejects.toThrowError(new NoAccessError(SKIP_CHANGE_REQUEST));
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
