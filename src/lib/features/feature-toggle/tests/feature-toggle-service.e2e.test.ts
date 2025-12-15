import type { FeatureToggleService } from '../feature-toggle-service.js';
import { createTestConfig } from '../../../../test/config/test-config.js';
import dbInit, {
    type ITestDb,
} from '../../../../test/e2e/helpers/database-init.js';
import { DEFAULT_ENV, extractAuditInfoFromUser } from '../../../util/index.js';
import type { FeatureStrategySchema } from '../../../openapi/index.js';
import type User from '../../../types/user.js';
import {
    type IConstraint,
    type IUnleashConfig,
    type IUnleashStores,
    type IVariant,
    SKIP_CHANGE_REQUEST,
    SYSTEM_USER_AUDIT,
    TEST_AUDIT_USER,
} from '../../../types/index.js';
import EnvironmentService from '../../project-environments/environment-service.js';
import {
    ForbiddenError,
    NotFoundError,
    PatternError,
    PermissionError,
} from '../../../error/index.js';
import type { ISegmentService } from '../../segment/segment-service-interface.js';
import {
    createEventsService,
    createFeatureLinkService,
    createFeatureToggleService,
    createSegmentService,
} from '../../index.js';
import { insertLastSeenAt } from '../../../../test/e2e/helpers/test-helper.js';
import type { EventService } from '../../../services/index.js';
import type FeatureLinkService from '../../feature-links/feature-link-service.js';
import {
    beforeAll,
    afterAll,
    beforeEach,
    test,
    expect,
    describe,
} from 'vitest';
let stores: IUnleashStores;
let db: ITestDb;
let service: FeatureToggleService;
let segmentService: ISegmentService;
let featureLinkService: FeatureLinkService;
let eventService: EventService;
let environmentService: EnvironmentService;
let unleashConfig: IUnleashConfig;
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

    featureLinkService = createFeatureLinkService(config)(db.rawDatabase);

    service = createFeatureToggleService(db.rawDatabase, config);

    eventService = createEventsService(db.rawDatabase, config);
});

afterAll(async () => {
    await db.rawDatabase('change_request_settings').del();
    await db.destroy();
});

beforeEach(async () => {
    await db.rawDatabase('change_request_settings').del();
});
test('Should create feature flag strategy configuration', async () => {
    const projectId = 'default';
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
        TEST_AUDIT_USER,
    );

    const createdConfig = await service.createStrategy(
        config,
        { projectId, featureName: 'Demo', environment: DEFAULT_ENV },
        TEST_AUDIT_USER,
    );

    expect(createdConfig.name).toEqual('default');
    expect(createdConfig.id).toBeDefined();
});

test('Should be able to update existing strategy configuration', async () => {
    const projectId = 'default';
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
        TEST_AUDIT_USER,
    );

    const createdConfig = await service.createStrategy(
        config,
        { projectId, featureName, environment: DEFAULT_ENV },
        TEST_AUDIT_USER,
    );
    expect(createdConfig.name).toEqual('default');
    const updatedConfig = await service.updateStrategy(
        createdConfig.id,
        { name: 'flexibleRollout', parameters: { b2b: 'true' } },
        { projectId, featureName, environment: DEFAULT_ENV },
        TEST_AUDIT_USER,
    );
    expect(createdConfig.id).toEqual(updatedConfig.id);
    expect(updatedConfig.name).toEqual('flexibleRollout');
    expect(updatedConfig.parameters).toEqual({
        b2b: 'true',
        // flexible rollout default parameters
        rollout: '100',
        groupId: featureName,
        stickiness: 'default',
    });
});

test('Should be able to get strategy by id', async () => {
    const featureName = 'get-strategy-by-id';
    const projectId = 'default';
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
        TEST_AUDIT_USER,
    );

    const createdConfig = await service.createStrategy(
        config,
        { projectId, featureName, environment: DEFAULT_ENV },
        TEST_AUDIT_USER,
    );
    const fetchedConfig = await service.getStrategy(createdConfig.id);
    expect(fetchedConfig).toEqual(createdConfig);
});

test('should ignore name in the body when updating feature flag', async () => {
    const featureName = 'body-name-update';
    const projectId = 'default';
    const secondFeatureName = 'body-name-update2';

    await service.createFeatureToggle(
        projectId,
        {
            name: featureName,
            description: 'First flag',
        },
        TEST_AUDIT_USER,
    );

    await service.createFeatureToggle(
        projectId,
        {
            name: secondFeatureName,
            description: 'Second flag',
        },
        TEST_AUDIT_USER,
    );

    const update = {
        name: secondFeatureName,
        description: "I'm changed",
    };

    await service.updateFeatureToggle(
        projectId,
        update,
        featureName,
        TEST_AUDIT_USER,
    );
    const featureOne = await service.getFeature({ featureName });
    const featureTwo = await service.getFeature({
        featureName: secondFeatureName,
    });

    expect(featureOne.description).toBe(`I'm changed`);
    expect(featureTwo.description).toBe('Second flag');
});

test('should not get empty rows as features', async () => {
    const projectId = 'default';

    await service.createFeatureToggle(
        projectId,
        {
            name: 'linked-with-segment',
            description: 'First flag',
        },
        TEST_AUDIT_USER,
    );

    await service.createFeatureToggle(
        projectId,
        {
            name: 'not-linked-with-segment',
            description: 'Second flag',
        },
        TEST_AUDIT_USER,
    );

    const user = { email: 'test@example.com' } as User;
    const postData = {
        name: 'Unlinked segment',
        constraints: mockConstraints(),
    };
    await segmentService.create(postData, extractAuditInfoFromUser(user));

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
            description: 'Second flag',
            variants: [
                {
                    name: 'variant1',
                    weight: 100,
                    weightType: 'fix',
                    stickiness: 'default',
                },
            ],
        },
        TEST_AUDIT_USER,
    );

    //force the variantEnvironments flag off so that we can test legacy behavior
    environmentService = new EnvironmentService(
        stores,
        {
            ...unleashConfig,
            // @ts-expect-error - incomplete flag resolver definition
            flagResolver: {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                isEnabled: (_flagName: string) => false,
            },
        },
        eventService,
    );

    await environmentService.addEnvironmentToProject(
        prodEnv,
        'default',
        SYSTEM_USER_AUDIT,
    );
    await environmentService.removeEnvironmentFromProject(
        prodEnv,
        'default',
        SYSTEM_USER_AUDIT,
    );
    await environmentService.addEnvironmentToProject(
        prodEnv,
        'default',
        SYSTEM_USER_AUDIT,
    );

    const flag = await service.getFeature({
        featureName,
        projectId: undefined,
        environmentVariants: false,
    });
    expect(flag.variants).toHaveLength(1);
});

test('cloning a feature flag copies variant environments correctly', async () => {
    const newFlagName = 'Molly';
    const clonedFlagName = 'Dolly';
    const targetEnv = 'gene-lab';

    await service.createFeatureToggle(
        'default',
        {
            name: newFlagName,
        },
        TEST_AUDIT_USER,
    );

    await stores.environmentStore.create({
        name: 'gene-lab',
        type: 'production',
    });

    await stores.featureEnvironmentStore.connectFeatureToEnvironmentsForProject(
        newFlagName,
        'default',
    );

    await stores.featureEnvironmentStore.addVariantsToFeatureEnvironment(
        newFlagName,
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
        newFlagName,
        'default',
        clonedFlagName,
        SYSTEM_USER_AUDIT,
        true,
    );

    const clonedFlag =
        await stores.featureStrategiesStore.getFeatureToggleWithVariantEnvs(
            clonedFlagName,
        );

    const defaultEnv = clonedFlag.environments.find(
        (x) => x.name === DEFAULT_ENV,
    );
    const newEnv = clonedFlag.environments.find((x) => x.name === targetEnv);

    expect(defaultEnv!!.variants).toHaveLength(0);
    expect(newEnv!!.variants).toHaveLength(1);
});

test('cloning a feature flag not allowed for change requests enabled', async () => {
    await db.rawDatabase('change_request_settings').insert({
        project: 'default',
        environment: DEFAULT_ENV,
    });
    await expect(
        service.cloneFeatureToggle(
            'newFlagName',
            'default',
            'clonedFlagName',
            SYSTEM_USER_AUDIT,
            true,
        ),
    ).rejects.errorWithMessage(
        new ForbiddenError(
            `Cloning not allowed. Project default has change requests enabled.`,
        ),
    );
});

test('changing to a project with change requests enabled should not be allowed', async () => {
    await db.rawDatabase('change_request_settings').insert({
        project: 'default',
        environment: DEFAULT_ENV,
    });
    await expect(
        service.changeProject('newFlagName', 'default', TEST_AUDIT_USER),
    ).rejects.errorWithMessage(
        new ForbiddenError(
            `Changing project not allowed. Project default has change requests enabled.`,
        ),
    );
});

test('Cloning a feature flag also clones segments correctly', async () => {
    const featureName = 'FlagWithSegments';
    const clonedFeatureName = 'AWholeNewFeatureFlag';

    const segment = await segmentService.create(
        {
            name: 'SomeSegment',
            constraints: mockConstraints(),
        },
        TEST_AUDIT_USER,
    );

    await service.createFeatureToggle(
        'default',
        {
            name: featureName,
        },
        TEST_AUDIT_USER,
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
        TEST_AUDIT_USER,
    );

    await service.cloneFeatureToggle(
        featureName,
        'default',
        clonedFeatureName,
        TEST_AUDIT_USER,
        true,
    );

    const feature = await service.getFeature({
        featureName: clonedFeatureName,
    });
    expect(
        feature.environments.find((x) => x.name === DEFAULT_ENV)?.strategies[0]
            .segments,
    ).toHaveLength(1);
});

test('Should not convert null title to empty string', async () => {
    const featureName = 'FeatureNoTitle';
    await service.createFeatureToggle(
        'default',
        {
            name: featureName,
        },
        TEST_AUDIT_USER,
    );
    const config: Omit<FeatureStrategySchema, 'id'> = {
        name: 'default',
        constraints: [],
        parameters: {},
    };
    await service.createStrategy(
        config,
        { projectId: 'default', featureName, environment: DEFAULT_ENV },
        TEST_AUDIT_USER,
    );

    const feature = await service.getFeature({
        featureName: featureName,
    });

    expect(feature.environments[0].strategies[0].title).toBe(null);
});

test('If change requests are enabled, cannot change variants without going via CR', async () => {
    const featureName = 'feature-with-variants-per-env-and-cr';
    await service.createFeatureToggle(
        'default',
        { name: featureName },
        TEST_AUDIT_USER,
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
        environment: DEFAULT_ENV,
    });
    return expect(async () =>
        customFeatureService.crProtectedSaveVariantsOnEnv(
            'default',
            featureName,
            DEFAULT_ENV,
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
            TEST_AUDIT_USER,
            [],
        ),
    ).rejects.toThrowError(
        expect.errorWithMessage(new PermissionError(SKIP_CHANGE_REQUEST)),
    );
});

test('If CRs are protected for any environment in the project stops bulk update of variants', async () => {
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

    const flag = await service.createFeatureToggle(
        project.id,
        { name: 'crOnVariantFlag' },
        TEST_AUDIT_USER,
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
        flag.name,
        [enabledEnv.name, disabledEnv.name],
        [variant],
        TEST_AUDIT_USER,
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
            flag.name,
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
            TEST_AUDIT_USER,
        ),
    ).rejects.toThrowError(
        expect.errorWithMessage(new PermissionError(SKIP_CHANGE_REQUEST)),
    );
});

test('getPlaygroundFeatures should return ids and titles (if they exist) on client strategies', async () => {
    const featureName = 'check-returned-strategy-configuration';
    const projectId = 'default';

    const title = 'custom strategy title';
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
        TEST_AUDIT_USER,
    );

    await service.createStrategy(
        config,
        { projectId, featureName, environment: DEFAULT_ENV },
        TEST_AUDIT_USER,
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

    await service.createFeatureToggle(
        projectId,
        {
            name: featureName,
        },
        TEST_AUDIT_USER,
    );

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

test.each([
    ['empty stickiness', { rollout: '100', stickiness: '' }],
    ['undefined stickiness', { rollout: '100' }],
    ['undefined parameters', undefined],
    [
        'different group id and stickiness',
        { rollout: '100', groupId: 'test-group', stickiness: 'userId' },
    ],
    ['different rollout', { rollout: '25' }],
    ['empty parameters', {}],
    ['extra parameters are preserved', { extra: 'value', rollout: '100' }],
])('Should use default parameters when creating a flexibleRollout strategy with %s', async (description, parameters: {
    [key: string]: any;
}) => {
    const strategy = {
        name: 'flexibleRollout',
        parameters,
        constraints: [],
    };
    const feature = {
        name: `test-feature-create-${description.replaceAll(' ', '-')}`,
    };
    const projectId = 'default';
    const defaultStickiness = `not-default-${description.replaceAll(' ', '-')}`;
    const expectedStickiness =
        parameters?.stickiness === ''
            ? defaultStickiness
            : (parameters?.stickiness ?? defaultStickiness);
    const expectedParameters = {
        ...parameters, // expect extra parameters to be preserved
        groupId: parameters?.groupId ?? feature.name,
        stickiness: expectedStickiness,
        rollout: parameters?.rollout ?? '100', // default rollout
    };
    await stores.projectStore.update({
        id: projectId,
        name: 'stickiness-project-test',
        defaultStickiness,
    });
    const context = {
        projectId,
        featureName: feature.name,
        environment: DEFAULT_ENV,
    };

    await service.createFeatureToggle(projectId, feature, TEST_AUDIT_USER);
    const createdStrategy = await service.createStrategy(
        strategy,
        context,
        TEST_AUDIT_USER,
    );

    const featureDB = await service.getFeature({
        featureName: feature.name,
    });

    expect(featureDB.environments[0].strategies[0].parameters).toStrictEqual(
        expectedParameters,
    );

    // Verify that updating the strategy with same data is idempotent
    await service.updateStrategy(
        createdStrategy.id,
        strategy,
        context,
        TEST_AUDIT_USER,
    );
    const featureDBAfterUpdate = await service.getFeature({
        featureName: feature.name,
    });

    expect(
        featureDBAfterUpdate.environments[0].strategies[0].parameters,
    ).toStrictEqual(expectedParameters);
});

test('Should not allow to add flags to archived projects', async () => {
    const project = await stores.projectStore.create({
        id: 'archivedProject',
        name: 'archivedProject',
    });
    await stores.projectStore.archive(project.id);

    await expect(
        service.createFeatureToggle(
            project.id,
            {
                name: 'irrelevant',
            },
            TEST_AUDIT_USER,
        ),
    ).rejects.errorWithMessage(
        new NotFoundError(
            `Active project with id archivedProject does not exist`,
        ),
    );
});

test('Should not allow to revive flags to archived projects', async () => {
    const project = await stores.projectStore.create({
        id: 'archivedProjectWithFlag',
        name: 'archivedProjectWithFlag',
    });
    const flag = await service.createFeatureToggle(
        project.id,
        {
            name: 'archiveFlag',
        },
        TEST_AUDIT_USER,
    );

    await service.archiveToggle(
        flag.name,
        { email: 'test@example.com' } as User,
        TEST_AUDIT_USER,
    );
    await stores.projectStore.archive(project.id);

    await expect(
        service.reviveFeature(flag.name, TEST_AUDIT_USER),
    ).rejects.errorWithMessage(
        new NotFoundError(
            `Active project with id archivedProjectWithFlag does not exist`,
        ),
    );

    await expect(
        service.reviveFeatures([flag.name], project.id, TEST_AUDIT_USER),
    ).rejects.errorWithMessage(
        new NotFoundError(
            `Active project with id archivedProjectWithFlag does not exist`,
        ),
    );
});

test('Should enable disabled strategies on feature environment enabled', async () => {
    const flagName = 'enableThisFlag';
    const project = 'default';
    const environment = DEFAULT_ENV;
    await service.createFeatureToggle(
        project,
        {
            name: flagName,
        },
        TEST_AUDIT_USER,
    );
    const config: Omit<FeatureStrategySchema, 'id'> = {
        name: 'default',
        constraints: [
            { contextName: 'userId', operator: 'IN', values: ['1', '1'] },
        ],
        parameters: { param: 'a' },
        variants: [
            {
                name: 'a',
                weight: 100,
                weightType: 'variable',
                stickiness: 'random',
            },
        ],
        disabled: true,
    };
    const createdConfig = await service.createStrategy(
        config,
        { projectId: project, featureName: flagName, environment },
        TEST_AUDIT_USER,
    );

    await service.updateEnabled(
        project,
        flagName,
        environment,
        true,
        TEST_AUDIT_USER,
        { email: 'test@example.com' } as User,
        true,
    );

    const strategy = await service.getStrategy(createdConfig.id);
    expect(strategy).toMatchObject({ ...config, disabled: false });
});

test('Should add links from templates when creating a feature flag', async () => {
    const projectId = 'default';
    const featureName = 'test-link-feature';

    await stores.projectStore.updateProjectEnterpriseSettings({
        id: projectId,
        linkTemplates: [
            {
                title: 'Issue tracker',
                urlTemplate:
                    'https://issues.example.com/project/{{project}}/tasks/{{feature}}',
            },
            {
                title: 'Docs',
                urlTemplate: 'https://docs.example.com/{{project}}/{{feature}}',
            },
        ],
    });

    await service.createFeatureToggle(
        projectId,
        { name: featureName },
        TEST_AUDIT_USER,
    );

    const links = await featureLinkService.getAll();

    expect(links.length).toBe(2);
    expect(links).toEqual(
        expect.arrayContaining([
            expect.objectContaining({
                title: 'Issue tracker',
                url: `https://issues.example.com/project/${projectId}/tasks/${featureName}`,
                featureName,
            }),
            expect.objectContaining({
                title: 'Docs',
                url: `https://docs.example.com/${projectId}/${featureName}`,
                featureName,
            }),
        ]),
    );
});
