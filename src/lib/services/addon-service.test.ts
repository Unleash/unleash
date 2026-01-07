import getLogger from '../../test/fixtures/no-logger.js';
import TagTypeService from '../features/tag-type/tag-type-service.js';
import {
    ADDON_CONFIG_CREATED,
    ADDON_CONFIG_DELETED,
    ADDON_CONFIG_UPDATED,
    FEATURE_CREATED,
} from '../events/index.js';
import createStores from '../../test/fixtures/store.js';

import AddonService from './addon-service.js';
import type { IAddonDto } from '../types/stores/addon-store.js';
import SimpleAddon from './addon-service-test-simple-addon.js';
import type { IAddonProviders } from '../addons/index.js';
import {
    type IFlagResolver,
    type IUnleashConfig,
    SYSTEM_USER,
    TEST_AUDIT_USER,
} from '../types/index.js';
import { createFakeEventsService } from '../internals.js';
import { createTestConfig } from '../../test/config/test-config.js';
import { IntegrationEventsService } from './index.js';
import joi from 'joi';
const { ValidationError } = joi;

const MASKED_VALUE = '*****';

let addonProvider: IAddonProviders;

const config: IUnleashConfig = createTestConfig();

function getSetup() {
    const stores = createStores();
    const eventService = createFakeEventsService(config);
    const tagTypeService = new TagTypeService(
        stores,
        { getLogger },
        eventService,
    );
    const integrationEventsService = new IntegrationEventsService(stores, {
        getLogger,
        flagResolver: {} as IFlagResolver,
    });

    addonProvider = {
        simple: new SimpleAddon({
            getLogger,
            unleashUrl: 'http://test',
            integrationEventsService,
            flagResolver: {} as IFlagResolver,
            eventBus: config.eventBus,
        }),
    };
    return {
        addonService: new AddonService(
            stores,
            {
                getLogger,
                // @ts-expect-error
                server: { unleashUrl: 'http://test' },
            },
            tagTypeService,
            eventService,
            integrationEventsService,
            addonProvider,
        ),
        eventService,
        stores,
        tagTypeService,
    };
}

test('should load addon configurations', async () => {
    const { addonService } = getSetup();

    const configs = await addonService.getAddons();

    expect(configs.length).toBe(0);
});

test('should load provider definitions', async () => {
    const { addonService } = getSetup();

    const providerDefinitions = addonService.getProviderDefinitions();

    const simple = providerDefinitions.find((p) => p.name === 'simple');

    expect(providerDefinitions.length).toBe(1);
    expect(simple!.name).toBe('simple');
});

test('should not allow addon-config for unknown provider', async () => {
    const { addonService } = getSetup();

    await expect(async () => {
        await addonService.createAddon(
            {
                provider: 'unknown',
                enabled: true,
                parameters: {},
                events: [],
                description: '',
            },
            TEST_AUDIT_USER,
        );
    }).rejects.toThrow(ValidationError);
});

test('should trigger simple-addon eventHandler', async () => {
    const { addonService, eventService } = getSetup();

    const config = {
        provider: 'simple',
        enabled: true,
        parameters: {
            url: 'http://localhost/wh',
            var: 'some-value',
        },
        events: [FEATURE_CREATED],
        description: '',
    };

    await addonService.createAddon(config, TEST_AUDIT_USER);

    // Feature flag was created
    await eventService.storeEvent({
        type: FEATURE_CREATED,
        createdBy: SYSTEM_USER.username!,
        createdByUserId: SYSTEM_USER.id,
        data: {
            name: 'some-toggle',
            enabled: false,
            strategies: [{ name: 'default' }],
        },
        ip: '127.0.0.1',
    });

    const simpleProvider = addonService.addonProviders.simple as SimpleAddon;
    const events = simpleProvider.getEvents();

    expect(events.length).toBe(1);
    expect(events[0].event.type).toBe(FEATURE_CREATED);
    expect(events[0].event.data.name).toBe('some-toggle');
});

test('should not trigger event handler if project of event is different from addon', async () => {
    const { addonService, eventService } = getSetup();
    const config = {
        provider: 'simple',
        enabled: true,
        events: [FEATURE_CREATED],
        projects: ['someproject'],
        description: '',
        parameters: {
            url: 'http://localhost:wh',
        },
    };

    await addonService.createAddon(config, TEST_AUDIT_USER);
    await eventService.storeEvent({
        type: FEATURE_CREATED,
        createdBy: SYSTEM_USER.username!,
        createdByUserId: SYSTEM_USER.id,
        project: 'someotherproject',
        data: {
            name: 'some-toggle',
            enabled: false,
            strategies: [{ name: 'default' }],
        },
        ip: '127.0.0.1',
    });
    const simpleProvider = addonService.addonProviders.simple as SimpleAddon;
    const events = simpleProvider.getEvents();

    expect(events.length).toBe(0);
});

test('should trigger event handler if project for event is one of the desired projects for addon', async () => {
    const { addonService, eventService } = getSetup();
    const desiredProject = 'desired';
    const otherProject = 'other';
    const config = {
        provider: 'simple',
        enabled: true,
        events: [FEATURE_CREATED],
        projects: [desiredProject],
        description: '',
        parameters: {
            url: 'http://localhost:wh',
        },
    };

    await addonService.createAddon(config, TEST_AUDIT_USER);
    await eventService.storeEvent({
        type: FEATURE_CREATED,
        createdBy: SYSTEM_USER.username!,
        createdByUserId: SYSTEM_USER.id,
        project: desiredProject,
        data: {
            name: 'some-toggle',
            enabled: false,
            strategies: [{ name: 'default' }],
        },
        ip: '127.0.0.1',
    });
    await eventService.storeEvent({
        type: FEATURE_CREATED,
        createdBy: SYSTEM_USER.username!,
        createdByUserId: SYSTEM_USER.id,
        project: otherProject,
        data: {
            name: 'other-toggle',
            enabled: false,
            strategies: [{ name: 'default' }],
        },
        ip: '127.0.0.1',
    });
    const simpleProvider = addonService.addonProviders.simple as SimpleAddon;
    const events = simpleProvider.getEvents();

    expect(events.length).toBe(1);
    expect(events[0].event.type).toBe(FEATURE_CREATED);
    expect(events[0].event.data.name).toBe('some-toggle');
});

test('should trigger events for multiple projects if addon is setup to filter multiple projects', async () => {
    const { addonService, eventService } = getSetup();
    const desiredProjects = ['desired', 'desired2'];
    const otherProject = 'other';
    const config = {
        provider: 'simple',
        enabled: true,
        events: [FEATURE_CREATED],
        projects: desiredProjects,
        description: '',
        parameters: {
            url: 'http://localhost:wh',
        },
    };

    await addonService.createAddon(config, TEST_AUDIT_USER);
    await eventService.storeEvent({
        type: FEATURE_CREATED,
        createdBy: SYSTEM_USER.username!,
        createdByUserId: SYSTEM_USER.id,
        project: desiredProjects[0],
        data: {
            name: 'some-toggle',
            enabled: false,
            strategies: [{ name: 'default' }],
        },
        ip: '127.0.0.1',
    });
    await eventService.storeEvent({
        type: FEATURE_CREATED,
        createdBy: SYSTEM_USER.username!,
        createdByUserId: SYSTEM_USER.id,
        project: otherProject,
        data: {
            name: 'other-toggle',
            enabled: false,
            strategies: [{ name: 'default' }],
        },
        ip: '127.0.0.1',
    });
    await eventService.storeEvent({
        type: FEATURE_CREATED,
        createdBy: SYSTEM_USER.username!,
        createdByUserId: SYSTEM_USER.id,
        project: desiredProjects[1],
        data: {
            name: 'third-toggle',
            enabled: false,
            strategies: [{ name: 'default' }],
        },
        ip: '127.0.0.1',
    });
    const simpleProvider = addonService.addonProviders.simple as SimpleAddon;
    const events = simpleProvider.getEvents();

    expect(events.length).toBe(2);
    expect(events[0].event.type).toBe(FEATURE_CREATED);
    expect(events[0].event.data.name).toBe('some-toggle');
    expect(events[1].event.type).toBe(FEATURE_CREATED);
    expect(events[1].event.data.name).toBe('third-toggle');
});

test('should filter events on environment if addon is setup to filter for it', async () => {
    const { addonService, eventService } = getSetup();
    const desiredEnvironment = 'desired';
    const otherEnvironment = 'other';
    const config = {
        provider: 'simple',
        enabled: true,
        events: [FEATURE_CREATED],
        projects: [],
        environments: [desiredEnvironment],
        description: '',
        parameters: {
            url: 'http://localhost:wh',
        },
    };

    await addonService.createAddon(config, TEST_AUDIT_USER);
    await eventService.storeEvent({
        type: FEATURE_CREATED,
        createdBy: SYSTEM_USER.username!,
        createdByUserId: SYSTEM_USER.id,
        project: desiredEnvironment,
        environment: desiredEnvironment,
        data: {
            name: 'some-toggle',
            enabled: false,
            strategies: [{ name: 'default' }],
        },
        ip: '127.0.0.1',
    });
    await eventService.storeEvent({
        type: FEATURE_CREATED,
        createdBy: SYSTEM_USER.username!,
        createdByUserId: SYSTEM_USER.id,
        environment: otherEnvironment,
        data: {
            name: 'other-toggle',
            enabled: false,
            strategies: [{ name: 'default' }],
        },
        ip: '127.0.0.1',
    });
    const simpleProvider = addonService.addonProviders.simple as SimpleAddon;
    const events = simpleProvider.getEvents();

    expect(events.length).toBe(1);
    expect(events[0].event.type).toBe(FEATURE_CREATED);
    expect(events[0].event.data.name).toBe('some-toggle');
});

test('should not filter out global events (no specific environment) even if addon is setup to filter for environments', async () => {
    const { addonService, eventService } = getSetup();
    const filteredEnvironment = 'filtered';
    const config = {
        provider: 'simple',
        enabled: true,
        events: [FEATURE_CREATED],
        projects: [],
        environments: [filteredEnvironment],
        description: '',
        parameters: {
            url: 'http://localhost:wh',
        },
    };

    const globalEventWithNoEnvironment = {
        type: FEATURE_CREATED,
        createdBy: SYSTEM_USER.username!,
        createdByUserId: SYSTEM_USER.id,
        project: 'some-project',
        data: {
            name: 'some-toggle',
            enabled: false,
            strategies: [{ name: 'default' }],
        },
        ip: '127.0.0.1',
    };

    await addonService.createAddon(config, TEST_AUDIT_USER);
    await eventService.storeEvent(globalEventWithNoEnvironment);
    const simpleProvider = addonService.addonProviders.simple as SimpleAddon;
    const events = simpleProvider.getEvents();

    expect(events.length).toBe(1);
    expect(events[0].event.type).toBe(FEATURE_CREATED);
    expect(events[0].event.data.name).toBe('some-toggle');
});

test('should not filter out global events (no specific project) even if addon is setup to filter for projects', async () => {
    const { addonService, eventService } = getSetup();
    const filteredProject = 'filtered';
    const config = {
        provider: 'simple',
        enabled: true,
        events: [FEATURE_CREATED],
        projects: [filteredProject],
        environments: [],
        description: '',
        parameters: {
            url: 'http://localhost:wh',
        },
    };

    const globalEventWithNoProject = {
        type: FEATURE_CREATED,
        createdBy: SYSTEM_USER.username!,
        createdByUserId: SYSTEM_USER.id,
        data: {
            name: 'some-toggle',
            enabled: false,
            strategies: [{ name: 'default' }],
        },
        ip: '127.0.0.1',
    };

    await addonService.createAddon(config, TEST_AUDIT_USER);
    await eventService.storeEvent(globalEventWithNoProject);
    const simpleProvider = addonService.addonProviders.simple as SimpleAddon;
    const events = simpleProvider.getEvents();

    expect(events.length).toBe(1);
    expect(events[0].event.type).toBe(FEATURE_CREATED);
    expect(events[0].event.data.name).toBe('some-toggle');
});

test('should support wildcard option for filtering addons', async () => {
    const { addonService, eventService } = getSetup();
    const desiredProjects = ['desired', 'desired2'];
    const otherProject = 'other';
    const config = {
        provider: 'simple',
        enabled: true,
        events: [FEATURE_CREATED],
        projects: ['*'],
        description: '',
        parameters: {
            url: 'http://localhost:wh',
        },
    };

    await addonService.createAddon(config, TEST_AUDIT_USER);
    await eventService.storeEvent({
        type: FEATURE_CREATED,
        createdBy: SYSTEM_USER.username!,
        createdByUserId: SYSTEM_USER.id,
        project: desiredProjects[0],
        data: {
            name: 'some-toggle',
            enabled: false,
            strategies: [{ name: 'default' }],
        },
        ip: '127.0.0.1',
    });
    await eventService.storeEvent({
        type: FEATURE_CREATED,
        createdBy: SYSTEM_USER.username!,
        createdByUserId: SYSTEM_USER.id,
        project: otherProject,
        data: {
            name: 'other-toggle',
            enabled: false,
            strategies: [{ name: 'default' }],
        },
        ip: '127.0.0.1',
    });
    await eventService.storeEvent({
        type: FEATURE_CREATED,
        createdBy: SYSTEM_USER.username!,
        createdByUserId: SYSTEM_USER.id,
        project: desiredProjects[1],
        data: {
            name: 'third-toggle',
            enabled: false,
            strategies: [{ name: 'default' }],
        },
        ip: '127.0.0.1',
    });
    const simpleProvider = addonService.addonProviders.simple as SimpleAddon;
    const events = simpleProvider.getEvents();

    expect(events).toHaveLength(3);
    expect(events[0].event.type).toBe(FEATURE_CREATED);
    expect(events[0].event.data.name).toBe('some-toggle');
    expect(events[1].event.type).toBe(FEATURE_CREATED);
    expect(events[1].event.data.name).toBe('other-toggle');
    expect(events[2].event.type).toBe(FEATURE_CREATED);
    expect(events[2].event.data.name).toBe('third-toggle');
});

test('Should support filtering by both project and environment', async () => {
    const { addonService, eventService } = getSetup();
    const desiredProjects = ['desired1', 'desired2', 'desired3'];
    const desiredEnvironments = ['env1', 'env2', 'env3'];
    const config = {
        provider: 'simple',
        enabled: true,
        events: [FEATURE_CREATED],
        projects: desiredProjects,
        environments: desiredEnvironments,
        description: '',
        parameters: {
            url: 'http://localhost:wh',
        },
    };
    const expectedFeatureNames = [
        'desired-toggle1',
        'desired-toggle2',
        'desired-toggle3',
    ];
    await addonService.createAddon(config, TEST_AUDIT_USER);
    await eventService.storeEvent({
        type: FEATURE_CREATED,
        createdBy: SYSTEM_USER.username!,
        createdByUserId: SYSTEM_USER.id,
        project: desiredProjects[0],
        environment: desiredEnvironments[0],
        data: {
            name: expectedFeatureNames[0],
            enabled: false,
            strategies: [{ name: 'default' }],
        },
        ip: '127.0.0.1',
    });
    await eventService.storeEvent({
        type: FEATURE_CREATED,
        createdBy: SYSTEM_USER.username!,
        createdByUserId: SYSTEM_USER.id,
        project: desiredProjects[0],
        environment: 'wrongenvironment',
        data: {
            name: 'other-toggle',
            enabled: false,
            strategies: [{ name: 'default' }],
        },
        ip: '127.0.0.1',
    });
    await eventService.storeEvent({
        type: FEATURE_CREATED,
        createdBy: SYSTEM_USER.username!,
        createdByUserId: SYSTEM_USER.id,
        project: desiredProjects[2],
        environment: desiredEnvironments[1],
        data: {
            name: expectedFeatureNames[1],
            enabled: false,
            strategies: [{ name: 'default' }],
        },
        ip: '127.0.0.1',
    });
    await eventService.storeEvent({
        type: FEATURE_CREATED,
        createdBy: SYSTEM_USER.username!,
        createdByUserId: SYSTEM_USER.id,
        project: desiredProjects[2],
        environment: desiredEnvironments[2],
        data: {
            name: expectedFeatureNames[2],
            enabled: false,
            strategies: [{ name: 'default' }],
        },
        ip: '127.0.0.1',
    });
    await eventService.storeEvent({
        type: FEATURE_CREATED,
        createdBy: SYSTEM_USER.username!,
        createdByUserId: SYSTEM_USER.id,
        project: 'wrongproject',
        environment: desiredEnvironments[0],
        data: {
            name: 'not-expected',
            enabled: false,
            strategies: [{ name: 'default' }],
        },
        ip: '127.0.0.1',
    });

    const simpleProvider = addonService.addonProviders.simple as SimpleAddon;
    const events = simpleProvider.getEvents();

    expect(events.length).toBe(3);
    expect(events[0].event.type).toBe(FEATURE_CREATED);
    expect(events[0].event.data.name).toBe(expectedFeatureNames[0]);
    expect(events[1].event.type).toBe(FEATURE_CREATED);
    expect(events[1].event.data.name).toBe(expectedFeatureNames[1]);
    expect(events[2].event.type).toBe(FEATURE_CREATED);
    expect(events[2].event.data.name).toBe(expectedFeatureNames[2]);
});

test('should create simple-addon config', async () => {
    const { addonService } = getSetup();

    const config: IAddonDto = {
        provider: 'simple',
        enabled: true,
        parameters: {
            url: 'http://localhost/wh',
            var: 'some-value',
        },
        events: [FEATURE_CREATED],
        description: '',
    };

    await addonService.createAddon(config, TEST_AUDIT_USER);
    const addons = await addonService.getAddons();

    expect(addons.length).toBe(1);
    expect(addons[0].provider).toBe('simple');
});

test('should create tag type for simple-addon', async () => {
    const { addonService, tagTypeService } = getSetup();

    const config: IAddonDto = {
        provider: 'simple',
        enabled: true,
        parameters: {
            url: 'http://localhost/wh',
            var: 'some-value',
        },
        events: [FEATURE_CREATED],
        description: '',
    };

    await addonService.createAddon(config, TEST_AUDIT_USER);
    const tagType = await tagTypeService.getTagType('me');

    expect(tagType.name).toBe('me');
});

test('should store ADDON_CONFIG_CREATE event', async () => {
    const { addonService, eventService } = getSetup();

    const config = {
        provider: 'simple',
        enabled: true,
        parameters: {
            url: 'http://localhost/wh',
            var: 'some-value',
        },
        events: [FEATURE_CREATED],
        description: '',
    };

    await addonService.createAddon(config, TEST_AUDIT_USER);

    const { events } = await eventService.getEvents();

    expect(events.length).toBe(2); // Also tag-types where created
    expect(events[1].type).toBe(ADDON_CONFIG_CREATED);
    expect(events[1].data.provider).toBe('simple');
});

test('should store ADDON_CONFIG_UPDATE event', async () => {
    const { addonService, eventService } = getSetup();

    const config: IAddonDto = {
        description: '',
        provider: 'simple',
        enabled: true,
        parameters: {
            url: 'http://localhost/wh',
            var: 'some-value',
        },
        events: [FEATURE_CREATED],
    };

    const addonConfig = await addonService.createAddon(config, TEST_AUDIT_USER);

    const updated = { ...addonConfig, description: 'test' };
    await addonService.updateAddon(addonConfig.id, updated, TEST_AUDIT_USER);

    const { events } = await eventService.getEvents();

    expect(events.length).toBe(3);
    expect(events[2].type).toBe(ADDON_CONFIG_UPDATED);
    expect(events[2].data.provider).toBe('simple');
});

test('should store ADDON_CONFIG_REMOVE event', async () => {
    const { addonService, eventService } = getSetup();

    const config: IAddonDto = {
        provider: 'simple',
        description: '',
        enabled: true,
        parameters: {
            url: 'http://localhost/wh',
            var: 'some-value',
        },
        events: [FEATURE_CREATED],
    };

    const addonConfig = await addonService.createAddon(config, TEST_AUDIT_USER);

    await addonService.removeAddon(addonConfig.id, TEST_AUDIT_USER);

    const { events } = await eventService.getEvents();

    expect(events.length).toBe(3);
    expect(events[2].type).toBe(ADDON_CONFIG_DELETED);
    expect(events[2].preData.id).toBe(addonConfig.id);
});

test('should hide sensitive fields when fetching', async () => {
    const { addonService } = getSetup();

    const config: IAddonDto = {
        provider: 'simple',
        enabled: true,
        description: '',
        parameters: {
            url: 'http://localhost/wh',
            var: 'some-value',
            sensitiveParam: 'should be hidden when fetching',
        },
        events: [FEATURE_CREATED],
    };

    const createdConfig = await addonService.createAddon(
        config,
        TEST_AUDIT_USER,
    );
    const addons = await addonService.getAddons();
    const addonRetrieved = await addonService.getAddon(createdConfig.id);

    expect(addons.length).toBe(1);
    expect(addons[0].parameters.sensitiveParam).toBe(MASKED_VALUE);
    expect(addonRetrieved.parameters.sensitiveParam).toBe(MASKED_VALUE);
});

test('should not overwrite masked values when updating', async () => {
    const { addonService, stores } = getSetup();

    const config: IAddonDto = {
        provider: 'simple',
        enabled: true,
        parameters: {
            url: 'http://localhost/wh',
            var: 'some-value',
        },
        events: [FEATURE_CREATED],
        description: '',
    };

    const addonConfig = await addonService.createAddon(config, TEST_AUDIT_USER);

    const updated = {
        ...addonConfig,
        parameters: { url: MASKED_VALUE, var: 'some-new-value' },
        description: 'test',
    };
    await addonService.updateAddon(addonConfig.id, updated, TEST_AUDIT_USER);

    const updatedConfig = await stores.addonStore.get(addonConfig.id);
    expect(updatedConfig!.parameters.url).toBe('http://localhost/wh');
    expect(updatedConfig!.parameters.var).toBe('some-new-value');
});

test('should reject addon config with missing required parameter when creating', async () => {
    const { addonService } = getSetup();

    const config = {
        provider: 'simple',
        enabled: true,
        parameters: {
            var: 'some-value',
        },
        events: [FEATURE_CREATED],
        description: '',
    };

    await expect(async () =>
        addonService.createAddon(config, TEST_AUDIT_USER),
    ).rejects.toThrow(ValidationError);
});

test('should reject updating addon config with missing required parameter', async () => {
    const { addonService } = getSetup();

    const addonConfig = {
        provider: 'simple',
        enabled: true,
        parameters: {
            url: 'https://some.site/api',
            var: 'some-value',
        },
        events: [FEATURE_CREATED],
        description: '',
    };

    const config = await addonService.createAddon(addonConfig, TEST_AUDIT_USER);
    const updated = {
        ...config,
        parameters: { var: 'some-new-value' },
        description: 'test',
    };
    await expect(async () =>
        addonService.updateAddon(config.id, updated, TEST_AUDIT_USER),
    ).rejects.toThrow(ValidationError);
});

test('Should reject addon config if a required parameter is just the empty string', async () => {
    const { addonService } = getSetup();

    const config = {
        provider: 'simple',
        enabled: true,
        parameters: {
            url: '',
            var: 'some-value',
        },
        events: [FEATURE_CREATED],
        description: '',
    };

    await expect(async () =>
        addonService.createAddon(config, TEST_AUDIT_USER),
    ).rejects.toThrow(ValidationError);
});
