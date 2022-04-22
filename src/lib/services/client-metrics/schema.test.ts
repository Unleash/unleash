import { clientRegisterSchema, clientMetricsSchema } from './schema';

test('clientRegisterSchema should allow empty ("") instanceId', () => {
    const { value } = clientRegisterSchema.validate({
        appName: 'test',
        instanceId: '',
        strategies: ['default'],
        started: Date.now(),
        interval: 100,
    });
    //@ts-ignore
    expect(value.instanceId).toBe('default');
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
