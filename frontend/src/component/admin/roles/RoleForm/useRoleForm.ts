import { useEffect, useState } from 'react';
import type { IPermission, ICheckedPermissions } from 'interfaces/permissions';
import type { IRole, PredefinedRoleType } from 'interfaces/role';
import { useRoles } from 'hooks/api/getters/useRoles/useRoles';
import { permissionsToCheckedPermissions } from 'utils/permissions';
import { ROOT_ROLE_TYPE } from '@server/util/constants';

enum ErrorField {
    NAME = 'name',
    DESCRIPTION = 'description',
    PERMISSIONS = 'permissions',
}

const DEFAULT_ERRORS = {
    [ErrorField.NAME]: undefined,
    [ErrorField.DESCRIPTION]: undefined,
    [ErrorField.PERMISSIONS]: undefined,
};

export type IRoleFormErrors = Record<ErrorField, string | undefined>;

export const useRoleForm = (
    initialName = '',
    initialDescription = '',
    initialPermissions: IPermission[] = [],
) => {
    const { roles, projectRoles } = useRoles();

    const [name, setName] = useState(initialName);
    const [description, setDescription] = useState(initialDescription);
    const [checkedPermissions, setCheckedPermissions] =
        useState<ICheckedPermissions>({});
    const [errors, setErrors] = useState<IRoleFormErrors>(DEFAULT_ERRORS);
    const [validated, setValidated] = useState(false);

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
        permissions: Object.values(checkedPermissions).map(
            ({ name, environment }) => ({ name, environment }),
        ),
    });

    const isNameUnique = (name: string) => {
        return ![...roles, ...projectRoles].some(
            (existingRole: IRole) =>
                existingRole.name !== initialName &&
                existingRole.name.toLowerCase() === name.toLowerCase(),
        );
    };

    const isNotEmpty = (value: string) => value.length;

    const hasPermissions = (permissions: ICheckedPermissions) =>
        Object.keys(permissions).length > 0;

    const clearError = (field: ErrorField) => {
        setErrors((errors) => ({ ...errors, [field]: undefined }));
    };

    const setError = (field: ErrorField, error: string) => {
        setErrors((errors) => ({ ...errors, [field]: error }));
    };

    const validateName = (name: string) => {
        if (!isNotEmpty(name)) {
            setError(ErrorField.NAME, 'Name is required.');
            return false;
        }

        if (!isNameUnique(name)) {
            setError(ErrorField.NAME, 'Name must be unique.');
            return false;
        }

        clearError(ErrorField.NAME);
        return true;
    };

    const validateDescription = (description: string) => {
        if (!isNotEmpty(description)) {
            setError(ErrorField.DESCRIPTION, 'Description is required.');
            return false;
        }

        clearError(ErrorField.DESCRIPTION);
        return true;
    };

    const validatePermissions = (permissions: ICheckedPermissions) => {
        if (!hasPermissions(permissions)) {
            setError(
                ErrorField.PERMISSIONS,
                'You must select at least one permission.',
            );
            return false;
        }

        clearError(ErrorField.PERMISSIONS);
        return true;
    };

    const validate = () => {
        const validName = validateName(name);
        const validDescription = validateDescription(description);
        const validPermissions = validatePermissions(checkedPermissions);

        setValidated(true);

        return validName && validDescription && validPermissions;
    };

    const showErrors = validated && Object.values(errors).some(Boolean);

    const reload = () => {
        setName(initialName);
        setDescription(initialDescription);
        setCheckedPermissions(
            permissionsToCheckedPermissions(initialPermissions),
        );
        setValidated(false);
        setErrors(DEFAULT_ERRORS);
    };

    return {
        name,
        setName,
        validateName,
        description,
        setDescription,
        validateDescription,
        checkedPermissions,
        setCheckedPermissions,
        validatePermissions,
        getRolePayload,
        errors,
        showErrors,
        validate,
        reload,
    };
};
