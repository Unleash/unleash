import { clientRegisterSchema, clientMetricsSchema } from './schema.js';

test('clientRegisterSchema should allow empty ("") instanceId', () => {
    const { value } = clientRegisterSchema.validate({
        appName: 'test',
        instanceId: '',
        strategies: ['default'],
        started: Date.now(),
        interval: 100,
    });
    expect(value.instanceId).toBe('default');
});

test('clientRegisterSchema should allow string dates', () => {
    const date = new Date();
    const { value } = clientRegisterSchema.validate({
        appName: 'test',
        strategies: ['default'],
        started: date.toISOString(),
        interval: 100,
    });
    expect(value.started).toStrictEqual(date);
});

test('clientRegisterSchema should allow undefined instanceId', () => {
    const { value } = clientRegisterSchema.validate({
        appName: 'test',
        strategies: ['default'],
        started: Date.now(),
        interval: 100,
    });

    expect(value.instanceId).toBe('default');
});

test('clientRegisterSchema should allow null instanceId', () => {
    const { value } = clientRegisterSchema.validate({
        appName: 'test',
        instanceId: null,
        strategies: ['default'],
        started: Date.now(),
        interval: 100,
    });
    expect(value.instanceId).toBe('default');
});

test('clientRegisterSchema should use instanceId', () => {
    const { value } = clientRegisterSchema.validate({
        appName: 'test',
        instanceId: 'some',
        strategies: ['default'],
        started: Date.now(),
        interval: 100,
    });
    expect(value.instanceId).toBe('some');
});

test('clientMetricsSchema should allow null instanceId', () => {
    const { value } = clientMetricsSchema.validate({
        appName: 'test',
        instanceId: null,
        bucket: {
            started: Date.now(),
            stopped: Date.now(),
        },
    });
    expect(value.instanceId).toBe('default');
});

test('clientMetricsSchema should allow empty ("") instanceId', () => {
    const { value } = clientMetricsSchema.validate({
        appName: 'test',
        instanceId: '',
        bucket: {
            started: Date.now(),
            stopped: Date.now(),
        },
    });
    expect(value.instanceId).toBe('default');
});

test('clientMetricsSchema should allow undefined instanceId', () => {
    const { value } = clientMetricsSchema.validate({
        appName: 'test',
        bucket: {
            started: Date.now(),
            stopped: Date.now(),
        },
    });

    expect(value.instanceId).toBe('default');
});

test('clientMetricsSchema should use instanceId', () => {
    const { value } = clientMetricsSchema.validate({
        appName: 'test',
        instanceId: 'some',
        bucket: {
            started: Date.now(),
            stopped: Date.now(),
        },
    });

    expect(value.instanceId).toBe('some');
});

test('clientMetricsSchema should accept null variants and default to empty object', () => {
    const { error, value } = clientMetricsSchema.validate({
        appName: 'test',
        bucket: {
            start: Date.now(),
            stop: Date.now(),
            toggles: {
                Demo: {
                    yes: 1,
                    no: 2,
                    variants: null,
                },
            },
        },
    });

    expect(error).toBeUndefined();
    expect(value.bucket.toggles.Demo.variants).toEqual({});
});
