import { ValidationError } from 'joi';

import getLogger from '../../test/fixtures/no-logger';
import TagTypeService from './tag-type-service';
import {
    ADDON_CONFIG_CREATED,
    ADDON_CONFIG_DELETED,
    ADDON_CONFIG_UPDATED,
    FEATURE_CREATED,
} from '../types/events';
import createStores from '../../test/fixtures/store';

import AddonService from './addon-service';
import { IAddonDto } from '../types/stores/addon-store';
import SimpleAddon from './addon-service-test-simple-addon';

const MASKED_VALUE = '*****';

const addonProvider = { simple: new SimpleAddon() };

function getSetup() {
    const stores = createStores();
    const tagTypeService = new TagTypeService(stores, { getLogger });

    return {
        addonService: new AddonService(
            stores,
            {
                getLogger,
                // @ts-ignore
                server: { unleashUrl: 'http://test' },
            },
            tagTypeService,
            addonProvider,
        ),
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

    const providerDefinitions = await addonService.getProviderDefinitions();

    const simple = providerDefinitions.find((p) => p.name === 'simple');

    expect(providerDefinitions.length).toBe(1);
    expect(simple.name).toBe('simple');
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
            'test',
        );
    }).rejects.toThrow(new TypeError('Unknown addon provider unknown'));
});

test('should trigger simple-addon eventHandler', async () => {
    const { addonService, stores } = getSetup();

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

    await addonService.createAddon(config, 'me@mail.com');

    // Feature toggle was created
    await stores.eventStore.store({
        type: FEATURE_CREATED,
        createdBy: 'some@user.com',
        data: {
            name: 'some-toggle',
            enabled: false,
            strategies: [{ name: 'default' }],
        },
    });

    const simpleProvider = addonService.addonProviders.simple;
    // @ts-ignore
    const events = simpleProvider.getEvents();

    expect(events.length).toBe(1);
    expect(events[0].event.type).toBe(FEATURE_CREATED);
    expect(events[0].event.data.name).toBe('some-toggle');
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

    await addonService.createAddon(config, 'me@mail.com');
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

    await addonService.createAddon(config, 'me@mail.com');
    const tagType = await tagTypeService.getTagType('me');

    expect(tagType.name).toBe('me');
});

test('should store ADDON_CONFIG_CREATE event', async () => {
    const { addonService, stores } = getSetup();

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

    await addonService.createAddon(config, 'me@mail.com');

    const events = await stores.eventStore.getEvents();

    expect(events.length).toBe(2); // Also tag-types where created
    expect(events[1].type).toBe(ADDON_CONFIG_CREATED);
    expect(events[1].data.provider).toBe('simple');
});

test('should store ADDON_CONFIG_UPDATE event', async () => {
    const { addonService, stores } = getSetup();

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

    const addonConfig = await addonService.createAddon(config, 'me@mail.com');

    const updated = { ...addonConfig, description: 'test' };
    await addonService.updateAddon(addonConfig.id, updated, 'me@mail.com');

    const events = await stores.eventStore.getEvents();

    expect(events.length).toBe(3);
    expect(events[2].type).toBe(ADDON_CONFIG_UPDATED);
    expect(events[2].data.provider).toBe('simple');
});

test('should store ADDON_CONFIG_REMOVE event', async () => {
    const { addonService, stores } = getSetup();

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

    const addonConfig = await addonService.createAddon(config, 'me@mail.com');

    await addonService.removeAddon(addonConfig.id, 'me@mail.com');

    const events = await stores.eventStore.getEvents();

    expect(events.length).toBe(3);
    expect(events[2].type).toBe(ADDON_CONFIG_DELETED);
    expect(events[2].data.id).toBe(addonConfig.id);
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

    const createdConfig = await addonService.createAddon(config, 'me@mail.com');
    const addons = await addonService.getAddons();
    const addonRetrieved = await addonService.getAddon(createdConfig.id);

    expect(addons.length).toBe(1);
    // @ts-ignore
    expect(addons[0].parameters.sensitiveParam).toBe(MASKED_VALUE);
    // @ts-ignore
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

    const addonConfig = await addonService.createAddon(config, 'me@mail.com');

    const updated = {
        ...addonConfig,
        parameters: { url: MASKED_VALUE, var: 'some-new-value' },
        description: 'test',
    };
    await addonService.updateAddon(addonConfig.id, updated, 'me@mail.com');

    const updatedConfig = await stores.addonStore.get(addonConfig.id);
    // @ts-ignore
    expect(updatedConfig.parameters.url).toBe('http://localhost/wh');
    // @ts-ignore
    expect(updatedConfig.parameters.var).toBe('some-new-value');
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
        addonService.createAddon(config, 'me@mail.com'),
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

    const config = await addonService.createAddon(addonConfig, 'me@mail.com');
    const updated = {
        ...config,
        parameters: { var: 'some-new-value' },
        description: 'test',
    };
    await expect(async () =>
        addonService.updateAddon(config.id, updated, 'me@mail.com'),
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
        addonService.createAddon(config, 'me@mail.com'),
    ).rejects.toThrow(ValidationError);
});
