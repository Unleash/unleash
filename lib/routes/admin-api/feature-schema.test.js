'use strict';

const test = require('ava');
const { featureShema } = require('./feature-schema');

test('should require URL firendly name', t => {
    const toggle = {
        name: 'io`dasd',
        enabled: false,
        strategies: [{ name: 'default' }],
    };

    const { error } = featureShema.validate(toggle);
    t.deepEqual(error.details[0].message, '"name" must be URL friendly');
});

test('should be valid toggle name', t => {
    const toggle = {
        name: 'app.name',
        enabled: false,
        strategies: [{ name: 'default' }],
    };

    const { value } = featureShema.validate(toggle);
    t.is(value.name, toggle.name);
});

test('should strip extra variant fields', t => {
    const toggle = {
        name: 'app.name',
        type: 'release',
        enabled: false,
        stale: false,
        strategies: [{ name: 'default' }],
        variants: [
            {
                name: 'variant-a',
                weight: 1,
                unkown: 'not-allowed',
            },
        ],
    };

    const { value } = featureShema.validate(toggle);
    t.notDeepEqual(value, toggle);
    t.falsy(value.variants[0].unkown);
});

test('should allow weightType=fix', t => {
    const toggle = {
        name: 'app.name',
        type: 'release',
        project: 'default',
        enabled: false,
        stale: false,
        strategies: [{ name: 'default' }],
        variants: [
            {
                name: 'variant-a',
                weight: 1,
                weightType: 'fix',
            },
        ],
    };

    const { value } = featureShema.validate(toggle);
    t.deepEqual(value, toggle);
});

test('should disallow weightType=unknown', t => {
    const toggle = {
        name: 'app.name',
        type: 'release',
        enabled: false,
        stale: false,
        strategies: [{ name: 'default' }],
        variants: [
            {
                name: 'variant-a',
                weight: 1,
                weightType: 'unknown',
            },
        ],
    };

    const { error } = featureShema.validate(toggle);
    t.deepEqual(
        error.details[0].message,
        '"variants[0].weightType" must be one of [variable, fix]',
    );
});

test('should be possible to define variant overrides', t => {
    const toggle = {
        name: 'app.name',
        type: 'release',
        project: 'some',
        enabled: false,
        stale: false,
        strategies: [{ name: 'default' }],
        variants: [
            {
                name: 'variant-a',
                weight: 1,
                weightType: 'variable',
                overrides: [
                    {
                        contextName: 'userId',
                        values: ['123'],
                    },
                ],
            },
        ],
    };

    const { value, error } = featureShema.validate(toggle);
    t.deepEqual(value, toggle);
    t.falsy(error);
});

test('variant overrides must have corect shape', async t => {
    t.plan(1);
    const toggle = {
        name: 'app.name',
        type: 'release',
        enabled: false,
        stale: false,
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
        await featureShema.validateAsync(toggle);
    } catch (error) {
        t.is(
            error.details[0].message,
            '"variants[0].overrides" must be an array',
        );
    }
});

test('should keep constraints', t => {
    const toggle = {
        name: 'app.constraints',
        type: 'release',
        project: 'default',
        enabled: false,
        stale: false,
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

    const { value, error } = featureShema.validate(toggle);
    t.deepEqual(value, toggle);
    t.falsy(error);
});

test('should not accept empty constraint values', t => {
    const toggle = {
        name: 'app.constraints.empty.value',
        type: 'release',
        enabled: false,
        stale: false,
        strategies: [
            {
                name: 'default',
                constraints: [
                    {
                        contextName: 'environment',
                        operator: 'IN',
                        values: [''],
                    },
                ],
            },
        ],
    };

    const { error } = featureShema.validate(toggle);
    t.deepEqual(
        error.details[0].message,
        '"strategies[0].constraints[0].values[0]" is not allowed to be empty',
    );
});

test('should not accept empty list of constraint values', t => {
    const toggle = {
        name: 'app.constraints.empty.value.list',
        type: 'release',
        enabled: false,
        stale: false,
        strategies: [
            {
                name: 'default',
                constraints: [
                    {
                        contextName: 'environment',
                        operator: 'IN',
                        values: [],
                    },
                ],
            },
        ],
    };

    const { error } = featureShema.validate(toggle);
    t.deepEqual(
        error.details[0].message,
        '"strategies[0].constraints[0].values" must contain at least 1 items',
    );
});
