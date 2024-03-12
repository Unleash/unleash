import {
    normalizeCustomContextProperties,
    type NormalizedContextProperties,
    validateTokenFormat,
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

describe('validateTokenFormat', () => {
    it('should throw an error for invalid token format without colon', () => {
        const invalidToken = 'invalidToken';
        expect(() => validateTokenFormat(invalidToken)).toThrow(
            'Invalid token format',
        );
    });

    it('should not throw an error for invalid token format without period', () => {
        const invalidToken = 'project:environment';
        expect(() => validateTokenFormat(invalidToken)).not.toThrow();
    });

    it('should throw an error for tokens with an empty project', () => {
        const invalidToken = ':environment.abc123';
        expect(() => validateTokenFormat(invalidToken)).toThrow(
            'Invalid token format',
        );
    });

    it('should throw an error for tokens with an empty environment', () => {
        const invalidToken = 'project:.abc123';
        expect(() => validateTokenFormat(invalidToken)).toThrow(
            'Invalid token format',
        );
    });

    it('should throw an error for admin tokens', () => {
        const adminToken = 'project:*.abc123';
        expect(() => validateTokenFormat(adminToken)).toThrow(
            'Admin tokens are not supported in the playground',
        );
    });

    it('should not throw an error for valid token formats', () => {
        const validToken = 'project:environment.abc123';
        expect(() => validateTokenFormat(validToken)).not.toThrow();
    });

    it('should not throw an error for valid token format and all projects', () => {
        const validToken = '*:environment.abc123';
        expect(() => validateTokenFormat(validToken)).not.toThrow();
    });
});
