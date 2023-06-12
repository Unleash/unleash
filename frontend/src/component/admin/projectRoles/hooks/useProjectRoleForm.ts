import { useEffect, useState } from 'react';
import { IPermission } from 'interfaces/permissions';
import cloneDeep from 'lodash.clonedeep';
import usePermissions from 'hooks/api/getters/usePermissions/usePermissions';
import { useRolesApi } from 'hooks/api/actions/useRolesApi/useRolesApi';
import { formatUnknownError } from 'utils/formatUnknownError';

export interface ICheckedPermission {
    [key: string]: IPermission;
}

const getRoleKey = (permission: {
    id: number;
    environment?: string;
}): string => {
    return permission.environment
        ? `${permission.id}-${permission.environment}`
        : `${permission.id}`;
};

const useProjectRoleForm = (
    initialRoleName = '',
    initialRoleDesc = '',
    initialCheckedPermissions: IPermission[] = []
) => {
    const { permissions } = usePermissions({
        revalidateIfStale: false,
        revalidateOnReconnect: false,
        revalidateOnFocus: false,
    });

    const [roleName, setRoleName] = useState(initialRoleName);
    const [roleDesc, setRoleDesc] = useState(initialRoleDesc);
    const [checkedPermissions, setCheckedPermissions] =
        useState<ICheckedPermission>({});

    useEffect(() => {
        if (initialCheckedPermissions.length > 0) {
            setCheckedPermissions(
                initialCheckedPermissions?.reduce(
                    (
                        acc: { [key: string]: IPermission },
                        curr: IPermission
                    ) => {
                        acc[getRoleKey(curr)] = curr;
                        return acc;
                    },
                    {}
                )
            );
        }
    }, [initialCheckedPermissions?.length]);

    const [errors, setErrors] = useState({});

    const { validateRole } = useRolesApi();

    useEffect(() => {
        setRoleName(initialRoleName);
    }, [initialRoleName]);

    useEffect(() => {
        setRoleDesc(initialRoleDesc);
    }, [initialRoleDesc]);

    const handlePermissionChange = (permission: IPermission) => {
        let checkedPermissionsCopy = cloneDeep(checkedPermissions);

        if (checkedPermissionsCopy[getRoleKey(permission)]) {
            delete checkedPermissionsCopy[getRoleKey(permission)];
        } else {
            checkedPermissionsCopy[getRoleKey(permission)] = { ...permission };
        }

        setCheckedPermissions(checkedPermissionsCopy);
    };

    const onToggleAllProjectPermissions = () => {
        const { project } = permissions;
        let checkedPermissionsCopy = cloneDeep(checkedPermissions);

        const allChecked = project.every(
            (permission: IPermission) =>
                checkedPermissionsCopy[getRoleKey(permission)]
        );

        if (allChecked) {
            project.forEach((permission: IPermission) => {
                delete checkedPermissionsCopy[getRoleKey(permission)];
            });
        } else {
            project.forEach((permission: IPermission) => {
                checkedPermissionsCopy[getRoleKey(permission)] = {
                    ...permission,
                };
            });
        }

        setCheckedPermissions(checkedPermissionsCopy);
    };

    const onToggleAllEnvironmentPermissions = (envName: string) => {
        const { environments } = permissions;
        const checkedPermissionsCopy = cloneDeep(checkedPermissions);
        const env = environments.find(env => env.name === envName);
        if (!env) return;

        const allChecked = env.permissions.every(
            (permission: IPermission) =>
                checkedPermissionsCopy[getRoleKey(permission)]
        );

        if (allChecked) {
            env.permissions.forEach((permission: IPermission) => {
                delete checkedPermissionsCopy[getRoleKey(permission)];
            });
        } else {
            env.permissions.forEach((permission: IPermission) => {
                checkedPermissionsCopy[getRoleKey(permission)] = {
                    ...permission,
                };
            });
        }

        setCheckedPermissions(checkedPermissionsCopy);
    };

    const getProjectRolePayload = () => ({
        name: roleName,
        description: roleDesc,
        permissions: Object.values(checkedPermissions),
    });

    const validateNameUniqueness = async () => {
        const payload = getProjectRolePayload();

        try {
            await validateRole(payload);
        } catch (error: unknown) {
            setErrors(prev => ({ ...prev, name: formatUnknownError(error) }));
        }
    };

    const validateName = () => {
        if (roleName.length === 0) {
            setErrors(prev => ({ ...prev, name: 'Name can not be empty.' }));
            return false;
        }
        return true;
    };

    const validatePermissions = () => {
        if (Object.keys(checkedPermissions).length === 0) {
            setErrors(prev => ({
                ...prev,
                permissions: 'You must include at least one permission.',
            }));
            return false;
        }
        return true;
    };

    const clearErrors = () => {
        setErrors({});
    };

    return {
        roleName,
        roleDesc,
        errors,
        checkedPermissions,
        permissions,
        setRoleName,
        setRoleDesc,
        handlePermissionChange,
        onToggleAllProjectPermissions,
        onToggleAllEnvironmentPermissions,
        getProjectRolePayload,
        validatePermissions,
        validateName,
        clearErrors,
        validateNameUniqueness,
        getRoleKey,
    };
};

export default useProjectRoleForm;
