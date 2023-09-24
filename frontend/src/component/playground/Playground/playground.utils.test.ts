import {
    normalizeCustomContextProperties,
    NormalizedContextProperties,
} from './playground.utils';

test('should keep standard properties in their place', () => {
    const input: NormalizedContextProperties = {
        appName: 'testApp',
        environment: 'testEnv',
        userId: 'testUser',
        sessionId: 'testSession',
        remoteAddress: '127.0.0.1',
        currentTime: 'now',
    };
    const output = normalizeCustomContextProperties(input);
    expect(output).toEqual(input);
});

test('should move non-standard properties to nested properties field', () => {
    const input = {
        appName: 'testApp',
        customProp: 'customValue',
        anotherCustom: 'anotherValue',
    };
    const output = normalizeCustomContextProperties(input);
    expect(output).toEqual({
        appName: 'testApp',
        properties: {
            customProp: 'customValue',
            anotherCustom: 'anotherValue',
        },
    });
});

test('should not have properties field if there are no non-standard properties', () => {
    const input = {
        appName: 'testApp',
    };
    const output = normalizeCustomContextProperties(input);
    expect(output).toEqual(input);
    expect(output.properties).toBeUndefined();
});

test('should combine existing properties field with non-standard properties', () => {
    const input = {
        appName: 'testApp',
        properties: {
            existingProp: 'existingValue',
        },
        customProp: 'customValue',
    };
    const output = normalizeCustomContextProperties(input);
    expect(output).toEqual({
        appName: 'testApp',
        properties: {
            existingProp: 'existingValue',
            customProp: 'customValue',
        },
    });
});

test('should add multiple standard properties without breaking custom properties', () => {
    const input = {
        appName: 'testApp',
        properties: {
            existingProp: 'existingValue',
        },
        currentTime: 'value',
    };
    const output = normalizeCustomContextProperties(input);
    expect(output).toEqual({
        appName: 'testApp',
        currentTime: 'value',
        properties: {
            existingProp: 'existingValue',
        },
    });
});
