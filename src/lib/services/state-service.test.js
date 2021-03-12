'use strict';

const test = require('ava');

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
} = require('../event-type');

function getSetup() {
    const stores = store.createStores();
    return {
        stateService: new StateService(stores, { getLogger }),
        stores,
    };
}

test('should import a feature', async t => {
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
    t.is(events.length, 1);
    t.is(events[0].type, FEATURE_IMPORT);
    t.is(events[0].data.name, 'new-feature');
});

test('should not import an existing feature', async t => {
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

    await stores.featureToggleStore.createFeature(data.features[0]);

    await stateService.import({ data, keepExisting: true });

    const events = await stores.eventStore.getEvents();
    t.is(events.length, 0);
});

test('should not keep existing feature if drop-before-import', async t => {
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

    await stores.featureToggleStore.createFeature(data.features[0]);

    await stateService.import({
        data,
        keepExisting: true,
        dropBeforeImport: true,
    });

    const events = await stores.eventStore.getEvents();
    t.is(events.length, 2);
    t.is(events[0].type, DROP_FEATURES);
    t.is(events[1].type, FEATURE_IMPORT);
});

test('should drop feature before import if specified', async t => {
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
    t.is(events.length, 2);
    t.is(events[0].type, DROP_FEATURES);
    t.is(events[1].type, FEATURE_IMPORT);
    t.is(events[1].data.name, 'new-feature');
});

test('should import a strategy', async t => {
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
    t.is(events.length, 1);
    t.is(events[0].type, STRATEGY_IMPORT);
    t.is(events[0].data.name, 'new-strategy');
});

test('should not import an existing strategy', async t => {
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
    t.is(events.length, 0);
});

test('should drop strategies before import if specified', async t => {
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
    t.is(events.length, 2);
    t.is(events[0].type, DROP_STRATEGIES);
    t.is(events[1].type, STRATEGY_IMPORT);
    t.is(events[1].data.name, 'new-strategy');
});

test('should drop neither features nor strategies when neither is imported', async t => {
    const { stateService, stores } = getSetup();

    const data = {};

    await stateService.import({ data, dropBeforeImport: true });

    const events = await stores.eventStore.getEvents();
    t.is(events.length, 0);
});

test('should not accept gibberish', async t => {
    const { stateService } = getSetup();

    const data1 = {
        type: 'gibberish',
        flags: { evil: true },
    };
    const data2 = '{somerandomtext/';

    await t.throwsAsync(stateService.import({ data: data1 }));

    await t.throwsAsync(stateService.import({ data: data2 }));
});

test('should export featureToggles', async t => {
    const { stateService, stores } = getSetup();

    stores.featureToggleStore.createFeature({ name: 'a-feature' });

    const data = await stateService.export({ includeFeatureToggles: true });

    t.is(data.features.length, 1);
    t.is(data.features[0].name, 'a-feature');
});

test('should export strategies', async t => {
    const { stateService, stores } = getSetup();

    stores.strategyStore.createStrategy({ name: 'a-strategy', editable: true });

    const data = await stateService.export({ includeStrategies: true });

    t.is(data.strategies.length, 1);
    t.is(data.strategies[0].name, 'a-strategy');
});

test('should import a tag and tag type', async t => {
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
    t.is(events.length, 3);
    t.is(events[0].type, TAG_TYPE_IMPORT);
    t.is(events[0].data.name, 'simple');
    t.is(events[1].type, TAG_IMPORT);
    t.is(events[1].data.value, 'test');
    t.is(events[2].type, FEATURE_TAG_IMPORT);
    t.is(events[2].data.featureName, 'demo-feature');
});

test('Should not import an existing tag', async t => {
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
    await stores.featureToggleStore.tagFeature(
        data.featureTags[0].featureName,
        {
            type: data.featureTags[0].tagType,
            value: data.featureTags[0].tagValue,
        },
    );
    await stateService.import({ data, keepExisting: true });
    const events = await stores.eventStore.getEvents();
    t.is(events.length, 0);
});

test('Should not keep existing tags if drop-before-import', async t => {
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
    t.is(tagTypes.length, 1);
});

test('should export tag, tagtypes and feature tags', async t => {
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
    await stores.featureToggleStore.tagFeature(
        data.featureTags[0].featureName,
        {
            type: data.featureTags[0].tagType,
            value: data.featureTags[0].tagValue,
        },
    );

    const exported = await stateService.export({
        includeFeatureToggles: false,
        includeStrategies: false,
        includeTags: true,
        includeProjects: false,
    });
    t.is(exported.tags.length, 1);
    t.is(exported.tags[0].type, data.tags[0].type);
    t.is(exported.tags[0].value, data.tags[0].value);
    t.is(exported.tagTypes.length, 1);
    t.is(exported.tagTypes[0].name, data.tagTypes[0].name);
    t.is(exported.featureTags.length, 1);
    t.is(exported.featureTags[0].featureName, data.featureTags[0].featureName);
    t.is(exported.featureTags[0].tagType, data.featureTags[0].tagType);
    t.is(exported.featureTags[0].tagValue, data.featureTags[0].tagValue);
});

test('should import a project', async t => {
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
    t.is(events.length, 1);
    t.is(events[0].type, PROJECT_IMPORT);
    t.is(events[0].data.name, 'default');
});

test('Should not import an existing project', async t => {
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
    t.is(events.length, 0);

    await stateService.import({ data });
});

test('Should drop projects before import if specified', async t => {
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
    return t.throwsAsync(async () => stores.projectStore.hasProject('fancy'), {
        instanceOf: NotFoundError,
    });
});

test('Should export projects', async t => {
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
    t.is(exported.projects[0].id, 'fancy');
    t.is(exported.projects[0].name, 'extra');
    t.is(exported.projects[0].description, 'No surprises here');
});
