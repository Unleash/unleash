import { useEffect, useState } from 'react';
import { IPermission, ICheckedPermissions } from 'interfaces/permissions';
import { IRole, PredefinedRoleType } from 'interfaces/role';
import { useRoles } from 'hooks/api/getters/useRoles/useRoles';
import { permissionsToCheckedPermissions } from 'utils/permissions';
import { ROOT_ROLE_TYPE } from '@server/util/constants';

enum ErrorField {
    NAME = 'name',
}

export interface IRoleFormErrors {
    [ErrorField.NAME]?: string;
}

export const useRoleForm = (
    initialName = '',
    initialDescription = '',
    initialPermissions: IPermission[] = []
) => {
    const { roles } = useRoles();

    const [name, setName] = useState(initialName);
    const [description, setDescription] = useState(initialDescription);
    const [checkedPermissions, setCheckedPermissions] =
        useState<ICheckedPermissions>({});
    const [errors, setErrors] = useState<IRoleFormErrors>({});

    useEffect(() => {
        setName(initialName);
    }, [initialName]);

    useEffect(() => {
        setDescription(initialDescription);
    }, [initialDescription]);

    useEffect(() => {
        const newCheckedPermissions =
            permissionsToCheckedPermissions(initialPermissions);
        setCheckedPermissions(newCheckedPermissions);
    }, [initialPermissions.length]);

    const getRolePayload = (type: PredefinedRoleType = ROOT_ROLE_TYPE) => ({
        name,
        description,
        type: type === ROOT_ROLE_TYPE ? 'root-custom' : 'custom',
        permissions: Object.values(checkedPermissions),
    });

    const isNameUnique = (name: string) => {
        return !roles.some(
            (existingRole: IRole) =>
                existingRole.name !== initialName &&
                existingRole.name.toLowerCase() === name.toLowerCase()
        );
    };

    const isNotEmpty = (value: string) => value.length;

    const hasPermissions = (permissions: ICheckedPermissions) =>
        Object.keys(permissions).length > 0;

    const clearError = (field: ErrorField) => {
        setErrors(errors => ({ ...errors, [field]: undefined }));
    };

    const setError = (field: ErrorField, error: string) => {
        setErrors(errors => ({ ...errors, [field]: error }));
    };

    return {
        name,
        description,
        checkedPermissions,
        errors,
        setName,
        setDescription,
        setCheckedPermissions,
        getRolePayload,
        clearError,
        setError,
        isNameUnique,
        isNotEmpty,
        hasPermissions,
        ErrorField,
    };
};
