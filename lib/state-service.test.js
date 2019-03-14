'use strict';

const test = require('ava');

const store = require('./../test/fixtures/store');
const StateService = require('./state-service');
const {
    FEATURE_IMPORT,
    DROP_FEATURES,
    STRATEGY_IMPORT,
    DROP_STRATEGIES,
} = require('./event-type');

function getSetup() {
    const stores = store.createStores();
    return { stateService: new StateService({ stores }), stores };
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

    stores.featureToggleStore.addFeature({ name: 'a-feature' });

    const data = await stateService.export({ includeFeatureToggles: true });

    t.is(data.features.length, 1);
    t.is(data.features[0].name, 'a-feature');
});

test('should export strategies', async t => {
    const { stateService, stores } = getSetup();

    stores.strategyStore.addStrategy({ name: 'a-strategy', editable: true });

    const data = await stateService.export({ includeStrategies: true });

    t.is(data.strategies.length, 1);
    t.is(data.strategies[0].name, 'a-strategy');
});
