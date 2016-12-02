'use strict';

const test = require('ava');
const mapper = require('./legacy-feature-mapper');

test('adds old fields to feature', t => {
    const feature = {
        name: 'test',
        enabled: 0,
        strategies: [{
            name: 'default',
            parameters: {
                val: 'bar',
            },
        }],
    };

    const mappedFeature = mapper.addOldFields(feature);

    t.true(mappedFeature.name === feature.name);
    t.true(mappedFeature.enabled === feature.enabled);
    t.true(mappedFeature.strategy === feature.strategies[0].name);
    t.true(mappedFeature.parameters !== feature.strategies[0].parameters);
    t.deepEqual(mappedFeature.parameters, feature.strategies[0].parameters);
});

test('adds old fields to feature handles missing strategies field', t => {
    const feature = {
        name: 'test',
        enabled: 0
    };

    const mappedFeature = mapper.addOldFields(feature);

    t.true(mappedFeature.name === feature.name);
    t.true(mappedFeature.enabled === feature.enabled);
    t.true(mappedFeature.strategies.length === 0);
});

test('transforms fields to new format', t => {
    const feature = {
        name: 'test',
        enabled: 0,
        strategy: 'default',
        parameters: {
            val: 'bar',
        },
    };

    const mappedFeature = mapper.toNewFormat(feature);

    t.true(mappedFeature.name === feature.name);
    t.true(mappedFeature.enabled === feature.enabled);
    t.true(mappedFeature.strategies.length === 1);
    t.true(mappedFeature.strategies[0].name === feature.strategy);
    t.deepEqual(mappedFeature.strategies[0].parameters, feature.parameters);
    t.true(mappedFeature.strategy === undefined);
    t.true(mappedFeature.parameters === undefined);
});

test('should not transform if it already is the new format', t => {
    const feature = {
        name: 'test',
        enabled: 0,
        description: 'test',
        createdAt: new Date(),
        strategies: [{
            name: 'default',
            parameters: {
                val: 'bar',
            },
        }],
    };

    const mappedFeature = mapper.toNewFormat(feature);

    t.deepEqual(mappedFeature, feature);
});
