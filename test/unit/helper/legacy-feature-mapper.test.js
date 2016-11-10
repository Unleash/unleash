'use strict';

const assert = require('assert');

const mapper = require('../../../lib/helper/legacy-feature-mapper');

describe('legacy-feature-mapper', () => {
    it('adds old fields to feature', () => {
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

        assert.equal(mappedFeature.name, feature.name);
        assert.equal(mappedFeature.enabled, feature.enabled);
        assert.equal(mappedFeature.strategy, feature.strategies[0].name);
        assert.notEqual(mappedFeature.parameters, feature.strategies[0].parameters);
        assert.deepEqual(mappedFeature.parameters, feature.strategies[0].parameters);
    });

    it('transforms fields to new format', () => {
        const feature = {
            name: 'test',
            enabled: 0,
            strategy: 'default',
            parameters: {
                val: 'bar',
            },
        };

        const mappedFeature = mapper.toNewFormat(feature);

        assert.equal(mappedFeature.name, feature.name);
        assert.equal(mappedFeature.enabled, feature.enabled);
        assert.equal(mappedFeature.strategies.length, 1);
        assert.equal(mappedFeature.strategies[0].name, feature.strategy);
        assert.deepEqual(mappedFeature.strategies[0].parameters, feature.parameters);
        assert(mappedFeature.strategy === undefined);
        assert(mappedFeature.parameters === undefined);
    });

    it('should not transform if it already is the new format', () => {
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

        const mappedFeature = mapper.toNewFormat(feature);

        assert.equal(mappedFeature, feature);
    });
});
