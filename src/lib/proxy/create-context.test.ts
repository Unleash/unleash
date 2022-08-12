// Copy of https://github.com/Unleash/unleash-proxy/blob/main/src/test/create-context.test.ts.

import { createContext } from './create-context';

test('should remove undefined properties', () => {
    const context = createContext({
        appName: undefined,
        userId: '123',
    });

    expect(context).not.toHaveProperty('appName');
    expect(context).toHaveProperty('userId');
    expect(context.userId).toBe('123');
});

test('should move rest props to properties', () => {
    const context = createContext({
        userId: '123',
        tenantId: 'some-tenant',
        region: 'eu',
    });

    expect(context.userId).toBe('123');
    expect(context).not.toHaveProperty('tenantId');
    expect(context).not.toHaveProperty('region');
    expect(context.properties?.region).toBe('eu');
    expect(context.properties?.tenantId).toBe('some-tenant');
});

test('should keep properties', () => {
    const context = createContext({
        userId: '123',
        tenantId: 'some-tenant',
        region: 'eu',
        properties: {
            a: 'b',
            b: 'test',
        },
    });

    expect(context.userId).toBe('123');
    expect(context).not.toHaveProperty('tenantId');
    expect(context).not.toHaveProperty('region');
    expect(context.properties?.region).toBe('eu');
    expect(context.properties?.tenantId).toBe('some-tenant');
    expect(context.properties?.a).toBe('b');
    expect(context.properties?.b).toBe('test');
});

test('will not blow up if properties is an array', () => {
    const context = createContext({
        userId: '123',
        tenantId: 'some-tenant',
        region: 'eu',
        properties: ['some'],
    });

    // console.log(context);

    expect(context.userId).toBe('123');
    expect(context).not.toHaveProperty('tenantId');
    expect(context).not.toHaveProperty('region');
});

test.skip('will not blow up if userId is an array', () => {
    const context = createContext({
        userId: ['123'],
        tenantId: 'some-tenant',
        region: 'eu',
        properties: ['some'],
    });

    // console.log(context);

    expect(context.userId).toBe('123');
    expect(context).not.toHaveProperty('tenantId');
    expect(context).not.toHaveProperty('region');
});
