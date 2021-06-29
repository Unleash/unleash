'use strict';

const store = require('../../test/fixtures/store');
const getLogger = require('../../test/fixtures/no-logger');

const StateService = require('./state-service');
const NotFoundError = require('../error/notfound-error');
const {
    FEATURE_IMPORT,
    DROP_FEATURES,
    STRATEGY_IMPORT,
    DROP_STRATEGIES,
    TAG_TYPE_IMPORT,
    TAG_IMPORT,
    FEATURE_TAG_IMPORT,
    PROJECT_IMPORT,
} = require('../types/events');

function getSetup() {
    const stores = store.createStores();
    return {
        stateService: new StateService(stores, { getLogger }),
        stores,
    };
}

test('should import a feature', async () => {
    const { stateService, stores } = getSetup();

    const data = {
        features: [
            {
                name: 'new-feature',
                enabled: true,
                strategies: [{ name: 'default' }],
            },
        ],
    };

    await stateService.import({ data });

    const events = await stores.eventStore.getEvents();
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe(FEATURE_IMPORT);
    expect(events[0].data.name).toBe('new-feature');
});

test('should not import an existing feature', async () => {
    const { stateService, stores } = getSetup();

    const data = {
        features: [
            {
                name: 'new-feature',
                enabled: true,
                strategies: [{ name: 'default' }],
            },
        ],
    };

    await stores.featureToggleStore.createFeature('default', data.features[0]);

    await stateService.import({ data, keepExisting: true });

    const events = await stores.eventStore.getEvents();
    expect(events).toHaveLength(0);
});

test('should not keep existing feature if drop-before-import', async () => {
    const { stateService, stores } = getSetup();

    const data = {
        features: [
            {
                name: 'new-feature',
                enabled: true,
                strategies: [{ name: 'default' }],
            },
        ],
    };

    await stores.featureToggleStore.createFeature('default', data.features[0]);

    await stateService.import({
        data,
        keepExisting: true,
        dropBeforeImport: true,
    });

    const events = await stores.eventStore.getEvents();
    expect(events).toHaveLength(2);
    expect(events[0].type).toBe(DROP_FEATURES);
    expect(events[1].type).toBe(FEATURE_IMPORT);
});

test('should drop feature before import if specified', async () => {
    const { stateService, stores } = getSetup();

    const data = {
        features: [
            {
                name: 'new-feature',
                enabled: true,
                strategies: [{ name: 'default' }],
            },
        ],
    };

    await stateService.import({ data, dropBeforeImport: true });

    const events = await stores.eventStore.getEvents();
    expect(events).toHaveLength(2);
    expect(events[0].type).toBe(DROP_FEATURES);
    expect(events[1].type).toBe(FEATURE_IMPORT);
    expect(events[1].data.name).toBe('new-feature');
});

test('should import a strategy', async () => {
    const { stateService, stores } = getSetup();

    const data = {
        strategies: [
            {
                name: 'new-strategy',
                parameters: [],
            },
        ],
    };

    await stateService.import({ data });

    const events = await stores.eventStore.getEvents();
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe(STRATEGY_IMPORT);
    expect(events[0].data.name).toBe('new-strategy');
});

test('should not import an existing strategy', async () => {
    const { stateService, stores } = getSetup();

    const data = {
        strategies: [
            {
                name: 'new-strategy',
                parameters: [],
            },
        ],
    };

    await stores.strategyStore.createStrategy(data.strategies[0]);

    await stateService.import({ data, keepExisting: true });

    const events = await stores.eventStore.getEvents();
    expect(events).toHaveLength(0);
});

test('should drop strategies before import if specified', async () => {
    const { stateService, stores } = getSetup();

    const data = {
        strategies: [
            {
                name: 'new-strategy',
                parameters: [],
            },
        ],
    };

    await stateService.import({ data, dropBeforeImport: true });

    const events = await stores.eventStore.getEvents();
    expect(events).toHaveLength(2);
    expect(events[0].type).toBe(DROP_STRATEGIES);
    expect(events[1].type).toBe(STRATEGY_IMPORT);
    expect(events[1].data.name).toBe('new-strategy');
});

test('should drop neither features nor strategies when neither is imported', async () => {
    const { stateService, stores } = getSetup();

    const data = {};

    await stateService.import({ data, dropBeforeImport: true });

    const events = await stores.eventStore.getEvents();
    expect(events).toHaveLength(0);
});

test('should not accept gibberish', async () => {
    const { stateService } = getSetup();

    const data1 = {
        type: 'gibberish',
        flags: { evil: true },
    };
    const data2 = '{somerandomtext/';

    await expect(async () =>
        stateService.import({ data: data1 }),
    ).rejects.toThrow();

    await expect(async () =>
        stateService.import({ data: data2 }),
    ).rejects.toThrow();
});

test('should export featureToggles', async () => {
    const { stateService, stores } = getSetup();

    stores.featureToggleStore.createFeature('default', { name: 'a-feature' });

    const data = await stateService.export({ includeFeatureToggles: true });

    expect(data.features).toHaveLength(1);
    expect(data.features[0].name).toBe('a-feature');
});

test('should export strategies', async () => {
    const { stateService, stores } = getSetup();

    stores.strategyStore.createStrategy({ name: 'a-strategy', editable: true });

    const data = await stateService.export({ includeStrategies: true });

    expect(data.strategies).toHaveLength(1);
    expect(data.strategies[0].name).toBe('a-strategy');
});

test('should import a tag and tag type', async () => {
    const { stateService, stores } = getSetup();
    const data = {
        tagTypes: [
            { name: 'simple', description: 'some description', icon: '#' },
        ],
        tags: [{ type: 'simple', value: 'test' }],
        featureTags: [
            {
                featureName: 'demo-feature',
                tagType: 'simple',
                tagValue: 'test',
            },
        ],
    };
    await stateService.import({ data });
    const events = await stores.eventStore.getEvents();
    expect(events).toHaveLength(3);
    expect(events[0].type).toBe(TAG_TYPE_IMPORT);
    expect(events[0].data.name).toBe('simple');
    expect(events[1].type).toBe(TAG_IMPORT);
    expect(events[1].data.value).toBe('test');
    expect(events[2].type).toBe(FEATURE_TAG_IMPORT);
    expect(events[2].data.featureName).toBe('demo-feature');
});

test('Should not import an existing tag', async () => {
    const { stateService, stores } = getSetup();
    const data = {
        tagTypes: [
            { name: 'simple', description: 'some description', icon: '#' },
        ],
        tags: [{ type: 'simple', value: 'test' }],
        featureTags: [
            {
                featureName: 'demo-feature',
                tagType: 'simple',
                tagValue: 'test',
            },
        ],
    };
    await stores.tagTypeStore.createTagType(data.tagTypes[0]);
    await stores.tagStore.createTag(data.tags[0]);
    await stores.featureTagStore.tagFeature(data.featureTags[0].featureName, {
        type: data.featureTags[0].tagType,
        value: data.featureTags[0].tagValue,
    });
    await stateService.import({ data, keepExisting: true });
    const events = await stores.eventStore.getEvents();
    expect(events).toHaveLength(0);
});

test('Should not keep existing tags if drop-before-import', async () => {
    const { stateService, stores } = getSetup();
    const notSoSimple = {
        name: 'notsosimple',
        description: 'some other description',
        icon: '#',
    };
    const slack = {
        name: 'slack',
        description: 'slack tags',
        icon: '#',
    };

    await stores.tagTypeStore.createTagType(notSoSimple);
    await stores.tagTypeStore.createTagType(slack);
    const data = {
        tagTypes: [
            { name: 'simple', description: 'some description', icon: '#' },
        ],
        tags: [{ type: 'simple', value: 'test' }],
        featureTags: [
            {
                featureName: 'demo-feature',
                tagType: 'simple',
                tagValue: 'test',
            },
        ],
    };
    await stateService.import({ data, dropBeforeImport: true });
    const tagTypes = await stores.tagTypeStore.getAll();
    expect(tagTypes).toHaveLength(1);
});

test('should export tag, tagtypes and feature tags', async () => {
    const { stateService, stores } = getSetup();

    const data = {
        tagTypes: [
            { name: 'simple', description: 'some description', icon: '#' },
        ],
        tags: [{ type: 'simple', value: 'test' }],
        featureTags: [
            {
                featureName: 'demo-feature',
                tagType: 'simple',
                tagValue: 'test',
            },
        ],
    };
    await stores.tagTypeStore.createTagType(data.tagTypes[0]);
    await stores.tagStore.createTag(data.tags[0]);
    await stores.featureTagStore.tagFeature(data.featureTags[0].featureName, {
        type: data.featureTags[0].tagType,
        value: data.featureTags[0].tagValue,
    });

    const exported = await stateService.export({
        includeFeatureToggles: false,
        includeStrategies: false,
        includeTags: true,
        includeProjects: false,
    });
    expect(exported.tags).toHaveLength(1);
    expect(exported.tags[0].type).toBe(data.tags[0].type);
    expect(exported.tags[0].value).toBe(data.tags[0].value);
    expect(exported.tagTypes).toHaveLength(1);
    expect(exported.tagTypes[0].name).toBe(data.tagTypes[0].name);
    expect(exported.featureTags).toHaveLength(1);
    expect(exported.featureTags[0].featureName).toBe(
        data.featureTags[0].featureName,
    );
    expect(exported.featureTags[0].tagType).toBe(data.featureTags[0].tagType);
    expect(exported.featureTags[0].tagValue).toBe(data.featureTags[0].tagValue);
});

test('should import a project', async () => {
    const { stateService, stores } = getSetup();

    const data = {
        projects: [
            {
                id: 'default',
                name: 'default',
                description: 'Some fancy description for project',
            },
        ],
    };

    await stateService.import({ data });

    const events = await stores.eventStore.getEvents();
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe(PROJECT_IMPORT);
    expect(events[0].data.name).toBe('default');
});

test('Should not import an existing project', async () => {
    const { stateService, stores } = getSetup();

    const data = {
        projects: [
            {
                id: 'default',
                name: 'default',
                description: 'Some fancy description for project',
            },
        ],
    };
    await stores.projectStore.create(data.projects[0]);

    await stateService.import({ data, keepExisting: true });
    const events = await stores.eventStore.getEvents();
    expect(events).toHaveLength(0);

    await stateService.import({ data });
});

test('Should drop projects before import if specified', async () => {
    const { stateService, stores } = getSetup();

    const data = {
        projects: [
            {
                id: 'default',
                name: 'default',
                description: 'Some fancy description for project',
            },
        ],
    };
    await stores.projectStore.create({
        id: 'fancy',
        name: 'extra',
        description: 'Not expected to be seen after import',
    });
    await stateService.import({ data, dropBeforeImport: true });
    return expect(async () =>
        stores.projectStore.hasProject('fancy'),
    ).rejects.toThrow(NotFoundError);
});

test('Should export projects', async () => {
    const { stateService, stores } = getSetup();
    await stores.projectStore.create({
        id: 'fancy',
        name: 'extra',
        description: 'No surprises here',
    });
    const exported = await stateService.export({
        includeFeatureToggles: false,
        includeStrategies: false,
        includeTags: false,
        includeProjects: true,
    });
    expect(exported.projects[0].id).toBe('fancy');
    expect(exported.projects[0].name).toBe('extra');
    expect(exported.projects[0].description).toBe('No surprises here');
});

test('exporting to new format works', async () => {
    const { stateService, stores } = getSetup();
    await stores.projectStore.create({
        id: 'fancy',
        name: 'extra',
        description: 'No surprises here',
    });
    await stores.environmentStore.upsert({
        name: 'dev',
        displayName: 'Development',
    });
    await stores.environmentStore.upsert({
        name: 'prod',
        displayName: 'Production',
    });
    await stores.featureToggleStore.createFeature('fancy', {
        name: 'Some-feature',
    });
    await stores.strategyStore.createStrategy({ name: 'format' });
    await stores.featureStrategiesStore.connectEnvironmentAndFeature(
        'Some-feature',
        'dev',
        true,
    );
    await stores.featureStrategiesStore.createStrategyConfig({
        featureName: 'Some-feature',
        projectName: 'fancy',
        strategyName: 'format',
        environment: 'dev',
        parameters: {},
        constraints: [],
    });
    await stores.featureTagStore.tagFeature('Some-feature', {
        type: 'simple',
        value: 'Test',
    });
    const exported = await stateService.export({});
    expect(exported.featureStrategies).toHaveLength(1);
});

test('featureStrategies can keep existing', async () => {
    const { stateService, stores } = getSetup();
    await stores.projectStore.create({
        id: 'fancy',
        name: 'extra',
        description: 'No surprises here',
    });
    await stores.environmentStore.upsert({
        name: 'dev',
        displayName: 'Development',
    });
    await stores.environmentStore.upsert({
        name: 'prod',
        displayName: 'Production',
    });
    await stores.featureToggleStore.createFeature('fancy', {
        name: 'Some-feature',
    });
    await stores.strategyStore.createStrategy({ name: 'format' });
    await stores.featureStrategiesStore.connectEnvironmentAndFeature(
        'Some-feature',
        'dev',
        true,
    );
    await stores.featureStrategiesStore.createStrategyConfig({
        featureName: 'Some-feature',
        projectName: 'fancy',
        strategyName: 'format',
        environment: 'dev',
        parameters: {},
        constraints: [],
    });
    await stores.featureTagStore.tagFeature('Some-feature', {
        type: 'simple',
        value: 'Test',
    });

    const exported = await stateService.export({});
    await stateService.import({
        data: exported,
        userName: 'testing',
        keepExisting: true,
    });
    expect(await stores.featureStrategiesStore.getAll()).toHaveLength(1);
});

test('featureStrategies should not keep existing if dropBeforeImport', async () => {
    const { stateService, stores } = getSetup();
    await stores.projectStore.create({
        id: 'fancy',
        name: 'extra',
        description: 'No surprises here',
    });
    await stores.environmentStore.upsert({
        name: 'dev',
        displayName: 'Development',
    });
    await stores.environmentStore.upsert({
        name: 'prod',
        displayName: 'Production',
    });
    await stores.featureToggleStore.createFeature('fancy', {
        name: 'Some-feature',
    });
    await stores.strategyStore.createStrategy({ name: 'format' });
    await stores.featureStrategiesStore.connectEnvironmentAndFeature(
        'Some-feature',
        'dev',
        true,
    );
    await stores.featureStrategiesStore.createStrategyConfig({
        featureName: 'Some-feature',
        projectName: 'fancy',
        strategyName: 'format',
        environment: 'dev',
        parameters: {},
        constraints: [],
    });
    await stores.featureTagStore.tagFeature('Some-feature', {
        type: 'simple',
        value: 'Test',
    });

    const exported = await stateService.export({});
    exported.featureStrategies = [];
    await stateService.import({
        data: exported,
        userName: 'testing',
        keepExisting: true,
        dropBeforeImport: true,
    });
    expect(await stores.featureStrategiesStore.getAll()).toHaveLength(0);
});
