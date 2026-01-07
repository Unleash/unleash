import { cleanPermissionEnvironment } from './access-service.js';

test('should convert all empty strings to null', () => {
    const permissions = [
        {
            name: 'UPDATE_PROJECT',
            environment: '',
        },
        {
            name: 'UPDATE_FEATURE_VARIANTS',
            environment: '',
        },
        {
            name: 'READ_PROJECT_API_TOKEN',
            environment: '',
        },
        {
            name: 'CREATE_PROJECT_API_TOKEN',
            environment: '',
        },
        {
            name: 'DELETE_PROJECT_API_TOKEN',
            environment: '',
        },
        {
            name: 'UPDATE_PROJECT_SEGMENT',
            environment: '',
        },
    ];

    const result = cleanPermissionEnvironment(permissions);

    expect(result).toEqual([
        {
            name: 'UPDATE_PROJECT',
            environment: null,
        },
        {
            name: 'UPDATE_FEATURE_VARIANTS',
            environment: null,
        },
        {
            name: 'READ_PROJECT_API_TOKEN',
            environment: null,
        },
        {
            name: 'CREATE_PROJECT_API_TOKEN',
            environment: null,
        },
        {
            name: 'DELETE_PROJECT_API_TOKEN',
            environment: null,
        },
        {
            name: 'UPDATE_PROJECT_SEGMENT',
            environment: null,
        },
    ]);
});

test('should handle some permissions already having null values', () => {
    const permissions = [
        {
            name: 'UPDATE_PROJECT',
            environment: null,
        },
        {
            name: 'UPDATE_FEATURE_VARIANTS',
            environment: null,
        },
        {
            name: 'READ_PROJECT_API_TOKEN',
            environment: '',
        },
        {
            name: 'CREATE_PROJECT_API_TOKEN',
            environment: '',
        },
        {
            name: 'DELETE_PROJECT_API_TOKEN',
            environment: '',
        },
        {
            name: 'UPDATE_PROJECT_SEGMENT',
            environment: '',
        },
    ];

    const result = cleanPermissionEnvironment(permissions);

    expect(result).toEqual([
        {
            name: 'UPDATE_PROJECT',
            environment: null,
        },
        {
            name: 'UPDATE_FEATURE_VARIANTS',
            environment: null,
        },
        {
            name: 'READ_PROJECT_API_TOKEN',
            environment: null,
        },
        {
            name: 'CREATE_PROJECT_API_TOKEN',
            environment: null,
        },
        {
            name: 'DELETE_PROJECT_API_TOKEN',
            environment: null,
        },
        {
            name: 'UPDATE_PROJECT_SEGMENT',
            environment: null,
        },
    ]);
});
