import { canGrantProjectRole } from './can-grant-project-role.js';

describe('canGrantProjectRole', () => {
    test('should return true if the granter has all the permissions the receiver needs', () => {
        const granterPermissions = [
            {
                project: 'test',
                environment: undefined,
                permission: 'CREATE_FEATURE',
            },
            {
                project: 'test',
                environment: 'production',
                permission: 'UPDATE_FEATURE_ENVIRONMENT',
            },
            {
                project: 'test',
                environment: 'production',
                permission: 'APPROVE_CHANGE_REQUEST',
            },
        ];

        const receiverPermissions = [
            {
                id: 28,
                name: 'UPDATE_FEATURE_ENVIRONMENT',
                environment: 'production',
                displayName: 'Enable/disable flags',
                type: 'environment',
            },
            {
                id: 29,
                name: 'APPROVE_CHANGE_REQUEST',
                environment: 'production',
                displayName: 'Enable/disable flags',
                type: 'environment',
            },
        ];

        canGrantProjectRole(granterPermissions, receiverPermissions);
    });

    test('should return false if the granter and receiver permissions have different environments', () => {
        const granterPermissions = [
            {
                project: 'test',
                environment: 'production',
                permission: 'UPDATE_FEATURE_ENVIRONMENT',
            },
            {
                project: 'test',
                environment: 'production',
                permission: 'APPROVE_CHANGE_REQUEST',
            },
        ];

        const receiverPermissions = [
            {
                id: 28,
                name: 'UPDATE_FEATURE_ENVIRONMENT',
                environment: 'development',
                displayName: 'Enable/disable flags',
                type: 'environment',
            },
            {
                id: 29,
                name: 'APPROVE_CHANGE_REQUEST',
                environment: 'development',
                displayName: 'Enable/disable flags',
                type: 'environment',
            },
        ];

        expect(
            canGrantProjectRole(granterPermissions, receiverPermissions),
        ).toBeFalsy();
    });

    test('should return false if the granter does not have all receiver permissions', () => {
        const granterPermissions = [
            {
                project: 'test',
                environment: 'production',
                permission: 'UPDATE_FEATURE_ENVIRONMENT',
            },
            {
                project: 'test',
                environment: 'production',
                permission: 'APPROVE_CHANGE_REQUEST',
            },
        ];

        const receiverPermissions = [
            {
                id: 28,
                name: 'UPDATE_FEATURE_ENVIRONMENT',
                environment: 'production',
                displayName: 'Enable/disable flags',
                type: 'environment',
            },
            {
                id: 29,
                name: 'APPROVE_CHANGE_REQUEST',
                environment: 'production',
                displayName: 'Enable/disable flags',
                type: 'environment',
            },
            {
                id: 26,
                name: 'UPDATE_FEATURE_STRATEGY',
                environment: 'production',
                displayName: 'Update activation strategies',
                type: 'environment',
            },
        ];

        expect(
            canGrantProjectRole(granterPermissions, receiverPermissions),
        ).toBeFalsy();
    });
});
