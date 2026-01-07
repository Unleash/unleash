import { describe, it, expect } from 'vitest';
import { createProjectPermissionsStructure } from './createProjectPermissionsStructure.js';

describe('createProjectPermissionsStructure', () => {
    it('returns an empty array when no permissions are given', () => {
        const result = createProjectPermissionsStructure([]);
        expect(result).toEqual([]);
    });

    it('groups known permissions into existing categories', () => {
        const result = createProjectPermissionsStructure([
            {
                name: 'CREATE_FEATURE',
                displayName: 'Create Feature',
                type: 'project',
            },
            {
                name: 'UPDATE_FEATURE',
                displayName: 'Update Feature',
                type: 'project',
            },
            {
                name: 'PROJECT_USER_ACCESS_READ',
                displayName: 'Read Project Access',
                type: 'project',
            },
            {
                name: 'SOME_UNKNOWN_PERMISSION',
                displayName: 'Unknown Permission',
                type: 'project',
            },
        ]);
        const featuresCategory = result.find(
            (cat) => cat.label === 'Features and strategies',
        );
        const projectSettingsCategory = result.find(
            (cat) => cat.label === 'Project settings',
        );

        expect(featuresCategory?.permissions).toHaveLength(2);
        expect(projectSettingsCategory?.permissions).toHaveLength(1);
    });

    it('places unknown permissions into the "Other" category', () => {
        const result = createProjectPermissionsStructure([
            {
                name: 'SOME_UNKNOWN_PERMISSION',
                displayName: 'Unknown Permission',
                type: 'project',
            },
        ]);
        const otherCategory = result.find((cat) => cat.label === 'Other');
        expect(otherCategory).toBeDefined();
        expect(otherCategory?.permissions).toHaveLength(1);
        const [[permission]] = otherCategory!.permissions;
        expect(permission.name).toBe('SOME_UNKNOWN_PERMISSION');
    });

    it('omits categories when they have no assigned permissions', () => {
        const result = createProjectPermissionsStructure([
            {
                name: 'CREATE_FEATURE',
                displayName: 'Create Feature',
                type: 'project',
            },
            {
                name: 'UPDATE_FEATURE',
                displayName: 'Update Feature',
                type: 'project',
            },
        ]);
        expect(result).toHaveLength(1);
        const projectSettingsCategory = result.find(
            (cat) => cat.label === 'Project settings',
        );
        expect(projectSettingsCategory).toBeUndefined();
    });

    it('includes parent permission names in the structure', () => {
        const result = createProjectPermissionsStructure([
            {
                name: 'PROJECT_USER_ACCESS_READ',
                displayName: 'Read Project Access',
                type: 'project',
            },
        ]);
        const permissions = result[0].permissions;
        expect(permissions[0]).toEqual([
            expect.objectContaining({ name: 'PROJECT_USER_ACCESS_READ' }),
            'UPDATE_PROJECT',
        ]);
    });
});
