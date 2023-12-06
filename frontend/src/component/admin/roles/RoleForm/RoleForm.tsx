import { Alert, styled } from '@mui/material';
import Input from 'component/common/Input/Input';
import { PermissionAccordion } from './PermissionAccordion/PermissionAccordion';
import {
    Person as UserIcon,
    Topic as TopicIcon,
    CloudCircle as CloudCircleIcon,
} from '@mui/icons-material';
import { ICheckedPermissions, IPermission } from 'interfaces/permissions';
import { IRoleFormErrors } from './useRoleForm';
import {
    flattenProjectPermissions,
    getCategorizedProjectPermissions,
    getCategorizedRootPermissions,
    toggleAllPermissions,
    togglePermission,
} from 'utils/permissions';
import usePermissions from 'hooks/api/getters/usePermissions/usePermissions';
import { PredefinedRoleType } from 'interfaces/role';
import {
    ENVIRONMENT_PERMISSION_TYPE,
    PROJECT_PERMISSION_TYPE,
    PROJECT_ROLE_TYPES,
    ROOT_ROLE_TYPE,
} from '@server/util/constants';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

const StyledInputDescription = styled('p')(({ theme }) => ({
    display: 'flex',
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(1),
    '&:not(:first-of-type)': {
        marginTop: theme.spacing(4),
    },
}));

const StyledInput = styled(Input)(({ theme }) => ({
    width: '100%',
    maxWidth: theme.spacing(50),
}));

const StyledInputFullWidth = styled(Input)({
    width: '100%',
});

interface IRoleFormProps {
    type?: PredefinedRoleType;
    name: string;
    setName: React.Dispatch<React.SetStateAction<string>>;
    validateName: (name: string) => boolean;
    description: string;
    setDescription: React.Dispatch<React.SetStateAction<string>>;
    validateDescription: (description: string) => boolean;
    checkedPermissions: ICheckedPermissions;
    setCheckedPermissions: React.Dispatch<
        React.SetStateAction<ICheckedPermissions>
    >;
    errors: IRoleFormErrors;
    showErrors: boolean;
}

export const RoleForm = ({
    type = ROOT_ROLE_TYPE,
    name,
    setName,
    description,
    setDescription,
    checkedPermissions,
    setCheckedPermissions,
    errors,
    showErrors,
    validateName,
    validateDescription,
}: IRoleFormProps) => {
    const { permissions } = usePermissions({
        revalidateIfStale: false,
        revalidateOnReconnect: false,
        revalidateOnFocus: false,
    });

    const isProjectRole = PROJECT_ROLE_TYPES.includes(type);

    const categories = isProjectRole
        ? getCategorizedProjectPermissions(
              flattenProjectPermissions(
                  permissions.project,
                  permissions.environments,
              ),
          )
        : getCategorizedRootPermissions(permissions.root);

    const onPermissionChange = (permission: IPermission) => {
        const newCheckedPermissions = togglePermission(
            checkedPermissions,
            permission,
        );
        setCheckedPermissions(newCheckedPermissions);
    };

    const onCheckAll = (permissions: IPermission[]) => {
        const newCheckedPermissions = toggleAllPermissions(
            checkedPermissions,
            permissions,
        );

        setCheckedPermissions(newCheckedPermissions);
    };

    const handleOnBlur = (callback: Function) => {
        setTimeout(() => callback(), 300);
    };

    return (
        <div>
            <StyledInputDescription>
                What is your new role name?
            </StyledInputDescription>
            <StyledInput
                autoFocus
                label='Role name *'
                error={Boolean(errors.name)}
                errorText={errors.name}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={(e) => handleOnBlur(() => validateName(e.target.value))}
                autoComplete='off'
            />
            <StyledInputDescription>
                What is your new role description?
            </StyledInputDescription>
            <StyledInputFullWidth
                label='Role description *'
                error={Boolean(errors.description)}
                errorText={errors.description}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={(e) =>
                    handleOnBlur(() => validateDescription(e.target.value))
                }
                autoComplete='off'
            />
            <StyledInputDescription>
                What is your role allowed to do?
            </StyledInputDescription>
            <Alert severity='info'>
                You must select at least one permission.
            </Alert>
            {categories.map(({ label, type, permissions }) => (
                <PermissionAccordion
                    key={label}
                    title={`${label} permissions`}
                    context={label.toLowerCase()}
                    Icon={
                        type === PROJECT_PERMISSION_TYPE ? (
                            <TopicIcon color='disabled' sx={{ mr: 1 }} />
                        ) : type === ENVIRONMENT_PERMISSION_TYPE ? (
                            <CloudCircleIcon color='disabled' sx={{ mr: 1 }} />
                        ) : (
                            <UserIcon color='disabled' sx={{ mr: 1 }} />
                        )
                    }
                    permissions={permissions}
                    checkedPermissions={checkedPermissions}
                    onPermissionChange={(permission: IPermission) =>
                        onPermissionChange(permission)
                    }
                    onCheckAll={() => onCheckAll(permissions)}
                />
            ))}
            <ConditionallyRender
                condition={showErrors}
                show={() => (
                    <Alert severity='error' icon={false}>
                        <ul>
                            {Object.values(errors)
                                .filter(Boolean)
                                .map((error) => (
                                    <li key={error}>{error}</li>
                                ))}
                        </ul>
                    </Alert>
                )}
            />
        </div>
    );
};
