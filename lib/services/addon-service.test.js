'use strict';

const test = require('ava');
const proxyquire = require('proxyquire').noCallThru();

const Addon = require('../addons/addon');

const store = require('../../test/fixtures/store');
const getLogger = require('../../test/fixtures/no-logger');
const TagTypeService = require('./tag-type-service');
const {
    FEATURE_CREATED,
    FEATURE_UPDATED,
    FEATURE_ARCHIVED,
    FEATURE_REVIVED,
    ADDON_CONFIG_CREATED,
    ADDON_CONFIG_UPDATED,
    ADDON_CONFIG_DELETED,
} = require('../event-type');

const definition = {
    name: 'simple',
    displayName: 'Simple ADdon',
    description: 'Some description',
    parameters: [
        {
            name: 'url',
            displayName: 'Some URL',
            type: 'url',
            required: true,
        },
        {
            name: 'var',
            displayName: 'Some var',
            description: 'Some variable to inject',
            type: 'text',
            required: false,
        },
    ],
    events: [
        FEATURE_CREATED,
        FEATURE_UPDATED,
        FEATURE_ARCHIVED,
        FEATURE_REVIVED,
    ],
    tagTypes: [
        {
            name: 'me',
            description: 'Some tag',
            icon: 'm',
        },
    ],
};

class SimpleAddon extends Addon {
    constructor() {
        super(definition, { getLogger });
        this.events = [];
    }

    getEvents() {
        return this.events;
    }

    async handleEvent(event, parameters) {
        this.events.push({
            event,
            parameters,
        });
    }
}

const AddonService = proxyquire.load('./addon-service', {
    '../addons': new Array(SimpleAddon),
});

function getSetup() {
    const stores = store.createStores();
    const tagTypeService = new TagTypeService(stores, { getLogger });
    return {
        addonService: new AddonService(stores, { getLogger }, tagTypeService),
        stores,
        tagTypeService,
    };
}

test('should load addon configurations', async t => {
    const { addonService } = getSetup();

    const configs = await addonService.getAddons();

    t.is(configs.length, 0);
});

test('should load provider definitions', async t => {
    const { addonService } = getSetup();

    const providerDefinitions = await addonService.getProviderDefinition();

    const simple = providerDefinitions.find(p => p.name === 'simple');

    t.is(providerDefinitions.length, 1);
    t.is(simple.name, 'simple');
});

test('should not allow addon-config for unknown provider', async t => {
    const { addonService } = getSetup();

    const error = await t.throwsAsync(
        async () => {
            await addonService.createAddon({ provider: 'unknown' });
        },
        { instanceOf: TypeError },
    );

    t.is(error.message, 'Unknown addon provider unknown');
});

test('should trigger simple-addon eventHandler', async t => {
    const { addonService, stores } = getSetup();

    const config = {
        provider: 'simple',
        enabled: true,
        parameters: {
            url: 'http://localhost/wh',
            var: 'some-value',
        },
        events: [FEATURE_CREATED],
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
    const events = simpleProvider.getEvents();

    t.is(events.length, 1);
    t.is(events[0].event.type, FEATURE_CREATED);
    t.is(events[0].event.data.name, 'some-toggle');
});

test('should create simple-addon config', async t => {
    const { addonService } = getSetup();

    const config = {
        provider: 'simple',
        enabled: true,
        parameters: {
            url: 'http://localhost/wh',
            var: 'some-value',
        },
        events: [FEATURE_CREATED],
    };

    await addonService.createAddon(config, 'me@mail.com');
    const addons = await addonService.getAddons();

    t.is(addons.length, 1);
    t.is(addons[0].provider, 'simple');
});

test('should create tag type for simple-addon', async t => {
    const { addonService, tagTypeService } = getSetup();

    const config = {
        provider: 'simple',
        enabled: true,
        parameters: {
            url: 'http://localhost/wh',
            var: 'some-value',
        },
        events: [FEATURE_CREATED],
    };

    await addonService.createAddon(config, 'me@mail.com');
    const tagType = await tagTypeService.getTagType('me');

    t.is(tagType.name, 'me');
});

test('should store ADDON_CONFIG_CREATE event', async t => {
    const { addonService, stores } = getSetup();

    const config = {
        provider: 'simple',
        enabled: true,
        parameters: {
            url: 'http://localhost/wh',
            var: 'some-value',
        },
        events: [FEATURE_CREATED],
    };

    await addonService.createAddon(config, 'me@mail.com');

    const events = await stores.eventStore.getEvents();

    t.is(events.length, 2); // Also tag-types where created
    t.is(events[1].type, ADDON_CONFIG_CREATED);
    t.is(events[1].data.provider, 'simple');
});

test('should store ADDON_CONFIG_UPDATE event', async t => {
    const { addonService, stores } = getSetup();

    const config = {
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

    t.is(events.length, 3);
    t.is(events[2].type, ADDON_CONFIG_UPDATED);
    t.is(events[2].data.provider, 'simple');
});

test('should store ADDON_CONFIG_REMOVE event', async t => {
    const { addonService, stores } = getSetup();

    const config = {
        provider: 'simple',
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

    t.is(events.length, 3);
    t.is(events[2].type, ADDON_CONFIG_DELETED);
    t.is(events[2].data.id, addonConfig.id);
});
