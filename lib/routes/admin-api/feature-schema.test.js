'use strict';

const test = require('ava');
const { featureShema } = require('./feature-schema');
const joi = require('joi');

test('should require URL firendly name', t => {
    const toggle = {
        name: 'io`dasd',
        enabled: false,
        strategies: [{ name: 'default' }],
    };

    const { error } = joi.validate(toggle, featureShema);
    t.deepEqual(error.details[0].message, '"name" must be URL friendly');
});

test('should be valid toggle name', t => {
    const toggle = {
        name: 'app.name',
        enabled: false,
        strategies: [{ name: 'default' }],
    };

    const { value } = joi.validate(toggle, featureShema);
    t.deepEqual(value, toggle);
});

test('should strip extra variant fields', t => {
    const toggle = {
        name: 'app.name',
        enabled: false,
        strategies: [{ name: 'default' }],
        variants: [
            {
                name: 'variant-a',
                weight: 1,
                unkown: 'not-allowed',
            },
        ],
    };

    const { value } = joi.validate(toggle, featureShema);
    t.notDeepEqual(value, toggle);
    t.falsy(value.variants[0].unkown);
});

test('should be possible to define variant overrides', t => {
    const toggle = {
        name: 'app.name',
        enabled: false,
        strategies: [{ name: 'default' }],
        variants: [
            {
                name: 'variant-a',
                weight: 1,
                overrides: [
                    {
                        contextName: 'userId',
                        values: ['123'],
                    },
                ],
            },
        ],
    };

    const { value, error } = joi.validate(toggle, featureShema);
    t.deepEqual(value, toggle);
    t.falsy(error);
});

test('variant overrides must have corect shape', async t => {
    t.plan(1);
    const toggle = {
        name: 'app.name',
        enabled: false,
        strategies: [{ name: 'default' }],
        variants: [
            {
                name: 'variant-a',
                weight: 1,
                overrides: {
                    userId: ['not-alloed'],
                    sessionId: ['not-alloed'],
                },
            },
        ],
    };

    try {
        await joi.validate(toggle, featureShema);
    } catch (error) {
        t.is(error.details[0].message, '"overrides" must be an array');
    }
});

test('should keep constraints', t => {
    const toggle = {
        name: 'app.constraints',
        enabled: false,
        strategies: [
            {
                name: 'default',
                constraints: [
                    {
                        contextName: 'environment',
                        operator: 'IN',
                        values: ['asd'],
                    },
                ],
            },
        ],
    };

    const { value, error } = joi.validate(toggle, featureShema);
    t.deepEqual(value, toggle);
    t.falsy(error);
});
