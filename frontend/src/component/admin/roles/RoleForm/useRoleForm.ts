import { useEffect, useState } from 'react';
import { IPermission, ICheckedPermissions } from 'interfaces/permissions';
import cloneDeep from 'lodash.clonedeep';
import usePermissions from 'hooks/api/getters/usePermissions/usePermissions';
import IRole from 'interfaces/role';
import { useRoles } from 'hooks/api/getters/useRoles/useRoles';

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
    const { permissions } = usePermissions({
        revalidateIfStale: false,
        revalidateOnReconnect: false,
        revalidateOnFocus: false,
    });

    const rootPermissions = permissions.root.filter(
        ({ name }) => name !== 'ADMIN'
    );

    const [name, setName] = useState(initialName);
    const [description, setDescription] = useState(initialDescription);
    const [checkedPermissions, setCheckedPermissions] =
        useState<ICheckedPermissions>({});

    useEffect(() => {
        if (initialPermissions.length > 0) {
            setCheckedPermissions(
                initialPermissions.reduce(
                    (
                        acc: { [key: string]: IPermission },
                        curr: IPermission
                    ) => {
                        acc[curr.id] = curr;
                        return acc;
                    },
                    {}
                )
            );
        }
    }, [initialPermissions.length]);

    const [errors, setErrors] = useState<IRoleFormErrors>({});

    useEffect(() => {
        setName(initialName);
    }, [initialName]);

    useEffect(() => {
        setDescription(initialDescription);
    }, [initialDescription]);

    const handlePermissionChange = (permission: IPermission) => {
        let checkedPermissionsCopy = cloneDeep(checkedPermissions);

        if (checkedPermissionsCopy[permission.id]) {
            delete checkedPermissionsCopy[permission.id];
        } else {
            checkedPermissionsCopy[permission.id] = { ...permission };
        }

        setCheckedPermissions(checkedPermissionsCopy);
    };

    const onToggleAllPermissions = () => {
        let checkedPermissionsCopy = cloneDeep(checkedPermissions);

        const allChecked = rootPermissions.every(
            (permission: IPermission) => checkedPermissionsCopy[permission.id]
        );

        if (allChecked) {
            rootPermissions.forEach((permission: IPermission) => {
                delete checkedPermissionsCopy[permission.id];
            });
        } else {
            rootPermissions.forEach((permission: IPermission) => {
                checkedPermissionsCopy[permission.id] = {
                    ...permission,
                };
            });
        }

        setCheckedPermissions(checkedPermissionsCopy);
    };

    const getRolePayload = () => ({
        name,
        description,
        type: 'root-custom',
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
        errors,
        checkedPermissions,
        rootPermissions,
        setName,
        setDescription,
        setCheckedPermissions,
        handlePermissionChange,
        onToggleAllPermissions,
        getRolePayload,
        clearError,
        setError,
        isNameUnique,
        isNotEmpty,
        hasPermissions,
        ErrorField,
    };
};
