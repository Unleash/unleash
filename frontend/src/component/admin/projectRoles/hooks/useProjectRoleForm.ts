import { useEffect, useState } from 'react';
import { IPermission } from 'interfaces/project';
import cloneDeep from 'lodash.clonedeep';
import useProjectRolePermissions from 'hooks/api/getters/useProjectRolePermissions/useProjectRolePermissions';
import useProjectRolesApi from 'hooks/api/actions/useProjectRolesApi/useProjectRolesApi';
import { formatUnknownError } from 'utils/formatUnknownError';

export interface ICheckedPermission {
    [key: string]: IPermission;
}

export const PROJECT_CHECK_ALL_KEY = 'check-all-project';
export const ENVIRONMENT_CHECK_ALL_KEY = 'check-all-environment';

const useProjectRoleForm = (
    initialRoleName = '',
    initialRoleDesc = '',
    initialCheckedPermissions = {}
) => {
    const { permissions } = useProjectRolePermissions({
        revalidateIfStale: false,
        revalidateOnReconnect: false,
        revalidateOnFocus: false,
    });

    const [roleName, setRoleName] = useState(initialRoleName);
    const [roleDesc, setRoleDesc] = useState(initialRoleDesc);
    const [checkedPermissions, setCheckedPermissions] =
        useState<ICheckedPermission>(initialCheckedPermissions);
    const [errors, setErrors] = useState({});

    const { validateRole } = useProjectRolesApi();

    useEffect(() => {
        setRoleName(initialRoleName);
    }, [initialRoleName]);

    useEffect(() => {
        setRoleDesc(initialRoleDesc);
    }, [initialRoleDesc]);

    const handleInitialCheckedPermissions = (
        initialCheckedPermissions: ICheckedPermission
    ) => {
        const formattedInitialCheckedPermissions =
            isAllEnvironmentPermissionsChecked(
                // @ts-expect-error
                isAllProjectPermissionsChecked(initialCheckedPermissions)
            );

        setCheckedPermissions(formattedInitialCheckedPermissions || {});
    };

    const isAllProjectPermissionsChecked = (
        initialCheckedPermissions: ICheckedPermission
    ) => {
        const { project } = permissions;
        if (!project || project.length === 0) return;
        const isAllChecked = project.every((permission: IPermission) => {
            return initialCheckedPermissions[getRoleKey(permission)];
        });

        if (isAllChecked) {
            // @ts-expect-error
            initialCheckedPermissions[PROJECT_CHECK_ALL_KEY] = true;
        } else {
            delete initialCheckedPermissions[PROJECT_CHECK_ALL_KEY];
        }

        return initialCheckedPermissions;
    };

    const isAllEnvironmentPermissionsChecked = (
        initialCheckedPermissions: ICheckedPermission
    ) => {
        const { environments } = permissions;
        if (!environments || environments.length === 0) return;
        environments.forEach(env => {
            const isAllChecked = env.permissions.every(
                (permission: IPermission) => {
                    return initialCheckedPermissions[getRoleKey(permission)];
                }
            );

            const key = `${ENVIRONMENT_CHECK_ALL_KEY}-${env.name}`;

            if (isAllChecked) {
                // @ts-expect-error
                initialCheckedPermissions[key] = true;
            } else {
                delete initialCheckedPermissions[key];
            }
        });
        return initialCheckedPermissions;
    };

    const getCheckAllKeys = () => {
        const { environments } = permissions;
        const envKeys = environments.map(env => {
            return `${ENVIRONMENT_CHECK_ALL_KEY}-${env.name}`;
        });

        return [...envKeys, PROJECT_CHECK_ALL_KEY];
    };

    const handlePermissionChange = (permission: IPermission, type: string) => {
        let checkedPermissionsCopy = cloneDeep(checkedPermissions);

        if (checkedPermissionsCopy[getRoleKey(permission)]) {
            delete checkedPermissionsCopy[getRoleKey(permission)];
        } else {
            checkedPermissionsCopy[getRoleKey(permission)] = { ...permission };
        }

        if (type === 'project') {
            // @ts-expect-error
            checkedPermissionsCopy = isAllProjectPermissionsChecked(
                checkedPermissionsCopy
            );
        } else {
            // @ts-expect-error
            checkedPermissionsCopy = isAllEnvironmentPermissionsChecked(
                checkedPermissionsCopy
            );
        }

        setCheckedPermissions(checkedPermissionsCopy);
    };

    const checkAllProjectPermissions = () => {
        const { project } = permissions;
        const checkedPermissionsCopy = cloneDeep(checkedPermissions);
        const checkedAll = checkedPermissionsCopy[PROJECT_CHECK_ALL_KEY];
        project.forEach((permission: IPermission, index: number) => {
            const lastItem = project.length - 1 === index;
            if (checkedAll) {
                if (checkedPermissionsCopy[getRoleKey(permission)]) {
                    delete checkedPermissionsCopy[getRoleKey(permission)];
                }

                if (lastItem) {
                    delete checkedPermissionsCopy[PROJECT_CHECK_ALL_KEY];
                }
            } else {
                checkedPermissionsCopy[getRoleKey(permission)] = {
                    ...permission,
                };

                if (lastItem) {
                    // @ts-expect-error
                    checkedPermissionsCopy[PROJECT_CHECK_ALL_KEY] = true;
                }
            }
        });

        setCheckedPermissions(checkedPermissionsCopy);
    };

    const checkAllEnvironmentPermissions = (envName: string) => {
        const { environments } = permissions;
        const checkedPermissionsCopy = cloneDeep(checkedPermissions);
        const environmentCheckAllKey = `${ENVIRONMENT_CHECK_ALL_KEY}-${envName}`;
        const env = environments.find(env => env.name === envName);
        if (!env) return;
        const checkedAll = checkedPermissionsCopy[environmentCheckAllKey];

        env.permissions.forEach((permission: IPermission, index: number) => {
            const lastItem = env.permissions.length - 1 === index;
            if (checkedAll) {
                if (checkedPermissionsCopy[getRoleKey(permission)]) {
                    delete checkedPermissionsCopy[getRoleKey(permission)];
                }

                if (lastItem) {
                    delete checkedPermissionsCopy[environmentCheckAllKey];
                }
            } else {
                checkedPermissionsCopy[getRoleKey(permission)] = {
                    ...permission,
                };

                if (lastItem) {
                    // @ts-expect-error
                    checkedPermissionsCopy[environmentCheckAllKey] = true;
                }
            }
        });

        setCheckedPermissions(checkedPermissionsCopy);
    };

    const getProjectRolePayload = () => {
        const checkAllKeys = getCheckAllKeys();
        const permissions = Object.keys(checkedPermissions)
            .filter(key => {
                return !checkAllKeys.includes(key);
            })
            .map(permission => {
                return checkedPermissions[permission];
            });
        return {
            name: roleName,
            description: roleDesc,
            permissions,
        };
    };

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

    const getRoleKey = (permission: {
        id: number;
        environment?: string;
    }): string => {
        return permission.environment
            ? `${permission.id}-${permission.environment}`
            : `${permission.id}`;
    };

    return {
        roleName,
        roleDesc,
        setRoleName,
        setRoleDesc,
        handlePermissionChange,
        checkAllProjectPermissions,
        checkAllEnvironmentPermissions,
        checkedPermissions,
        getProjectRolePayload,
        validatePermissions,
        validateName,
        handleInitialCheckedPermissions,
        clearErrors,
        validateNameUniqueness,
        errors,
        getRoleKey,
        permissions,
    };
};

export default useProjectRoleForm;
