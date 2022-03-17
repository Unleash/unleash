import { constraintSchema, featureSchema, querySchema } from './feature-schema';

test('should require URL firendly name', () => {
    const toggle = {
        name: 'io`dasd',
        enabled: false,
        impressionData: false,
        strategies: [{ name: 'default' }],
    };

    const { error } = featureSchema.validate(toggle);
    expect(error.details[0].message).toEqual('"name" must be URL friendly');
});

test('should be valid toggle name', () => {
    const toggle = {
        name: 'app.name',
        enabled: false,
        impressionData: false,
        strategies: [{ name: 'default' }],
    };

    const { value } = featureSchema.validate(toggle);
    expect(value.name).toBe(toggle.name);
});

test('should strip extra variant fields', () => {
    const toggle = {
        name: 'app.name',
        type: 'release',
        enabled: false,
        stale: false,
        impressionData: false,
        strategies: [{ name: 'default' }],
        variants: [
            {
                name: 'variant-a',
                weight: 1,
                unkown: 'not-allowed',
            },
        ],
    };

    const { value } = featureSchema.validate(toggle);
    expect(value).not.toEqual(toggle);
    expect(value.variants[0].unkown).toBeFalsy();
});

test('should allow weightType=fix', () => {
    const toggle = {
        name: 'app.name',
        type: 'release',
        project: 'default',
        enabled: false,
        impressionData: false,
        stale: false,
        archived: false,
        strategies: [{ name: 'default' }],
        variants: [
            {
                name: 'variant-a',
                weight: 1,
                weightType: 'fix',
                stickiness: 'default',
            },
        ],
    };

    const { value } = featureSchema.validate(toggle);
    expect(value).toEqual(toggle);
});

test('should disallow weightType=unknown', () => {
    const toggle = {
        name: 'app.name',
        type: 'release',
        enabled: false,
        impressionData: false,
        stale: false,
        archived: false,
        strategies: [{ name: 'default' }],
        variants: [
            {
                name: 'variant-a',
                weight: 1,
                weightType: 'unknown',
            },
        ],
    };

    const { error } = featureSchema.validate(toggle);
    expect(error.details[0].message).toEqual(
        '"variants[0].weightType" must be one of [variable, fix]',
    );
});

test('should be possible to define variant overrides', () => {
    const toggle = {
        name: 'app.name',
        type: 'release',
        project: 'some',
        enabled: false,
        impressionData: false,
        stale: false,
        archived: false,
        strategies: [{ name: 'default' }],
        variants: [
            {
                name: 'variant-a',
                weight: 1,
                weightType: 'variable',
                stickiness: 'default',
                overrides: [
                    {
                        contextName: 'userId',
                        values: ['123'],
                    },
                ],
            },
        ],
    };

    const { value, error } = featureSchema.validate(toggle);
    expect(value).toEqual(toggle);
    expect(error).toBeFalsy();
});

test('variant overrides must have corect shape', async () => {
    expect.assertions(1);
    const toggle = {
        name: 'app.name',
        type: 'release',
        enabled: false,
        impressionData: false,
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
        await featureSchema.validateAsync(toggle);
    } catch (error) {
        expect(error.details[0].message).toBe(
            '"variants[0].overrides" must be an array',
        );
    }
});

test('should keep constraints', () => {
    const toggle = {
        name: 'app.constraints',
        type: 'release',
        project: 'default',
        enabled: false,
        impressionData: false,
        stale: false,
        archived: false,
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

    const { value, error } = featureSchema.validate(toggle);
    expect(value).toEqual(toggle);
    expect(error).toBeFalsy();
});

test('should not accept empty constraint values', () => {
    const toggle = {
        name: 'app.constraints.empty.value',
        type: 'release',
        enabled: false,
        impressionData: false,
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

    const { error } = featureSchema.validate(toggle);
    expect(error.details[0].message).toEqual(
        '"strategies[0].constraints[0].values[0]" is not allowed to be empty',
    );
});

test('should accept empty list of constraint values', async () => {
    const toggle = {
        name: 'app.constraints.empty.value.list',
        type: 'release',
        enabled: false,
        impressionData: false,
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

    const validated = await featureSchema.validateAsync(toggle);
    expect(validated.strategies.length).toEqual(1);
    expect(validated.strategies[0].constraints.length).toEqual(1);
    expect(validated.strategies[0].constraints[0].values).toEqual([]);
});

test('Filter queries should accept a list of tag values', () => {
    const query = {
        tag: ['simple:valuea', 'simple:valueb'],
    };
    const { value } = querySchema.validate(query);
    expect(value).toEqual({ tag: ['simple:valuea', 'simple:valueb'] });
});

test('Filter queries should reject tag values with missing type prefix', () => {
    const query = {
        tag: ['simple', 'simple'],
    };
    const { error } = querySchema.validate(query);
    expect(error.details[0].message).toEqual(
        '"tag[0]" with value "simple" fails to match the tag pattern',
    );
});

test('Filter queries should allow project names', () => {
    const query = {
        project: ['projecta'],
    };
    const { value } = querySchema.validate(query);
    expect(value).toEqual({ project: ['projecta'] });
});

test('Filter queries should reject project names that are not alphanum', () => {
    const query = {
        project: ['project name with space'],
    };
    const { error } = querySchema.validate(query);
    expect(error.details[0].message).toEqual(
        '"project[0]" must be URL friendly',
    );
});

test('constraint schema should only allow specified operators', async () => {
    const invalidConstraint = {
        contextName: 'semver',
        operator: 'INVALID_OPERATOR',
        value: 123123213123,
    };
    expect.assertions(1);

    try {
        await constraintSchema.validateAsync(invalidConstraint);
    } catch (error) {
        expect(error.message).toBe(
            '"operator" must be one of [NOT_IN, IN, STR_ENDS_WITH, STR_STARTS_WITH, STR_CONTAINS, NUM_EQ, NUM_GT, NUM_GTE, NUM_LT, NUM_LTE, DATE_AFTER, DATE_BEFORE, SEMVER_EQ, SEMVER_GT, SEMVER_LT]',
        );
    }
});

test('constraint schema should add a values array by default', async () => {
    const validated = await constraintSchema.validateAsync({
        contextName: 'x',
        operator: 'NUM_EQ',
        value: 1,
    });

    expect(validated).toEqual({
        contextName: 'x',
        operator: 'NUM_EQ',
        value: 1,
        values: [],
    });
});
