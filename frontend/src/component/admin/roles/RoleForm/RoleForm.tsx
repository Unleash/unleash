import { styled } from '@mui/material';
import Input from 'component/common/Input/Input';
import { PermissionAccordion } from 'component/admin/projectRoles/ProjectRoleForm/PermissionAccordion/PermissionAccordion';
import { Person as UserIcon } from '@mui/icons-material';
import { ICheckedPermissions, IPermission } from 'interfaces/permissions';
import { IRoleFormErrors } from './useRoleForm';

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

interface IRoleFormProps {
    name: string;
    onSetName: (name: string) => void;
    description: string;
    setDescription: React.Dispatch<React.SetStateAction<string>>;
    checkedPermissions: ICheckedPermissions;
    handlePermissionChange: (permission: IPermission) => void;
    onToggleAllPermissions: () => void;
    permissions: IPermission[];
    errors: IRoleFormErrors;
}

export const RoleForm = ({
    name,
    onSetName,
    description,
    setDescription,
    checkedPermissions,
    handlePermissionChange,
    onToggleAllPermissions,
    permissions,
    errors,
}: IRoleFormProps) => {
    return (
        <div>
            <StyledInputDescription>
                What is your new role name?
            </StyledInputDescription>
            <StyledInput
                autoFocus
                label="Role name"
                error={Boolean(errors.name)}
                errorText={errors.name}
                value={name}
                onChange={e => onSetName(e.target.value)}
                autoComplete="off"
                required
            />
            <StyledInputDescription>
                What is your new role description?
            </StyledInputDescription>
            <StyledInput
                label="Role description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                autoComplete="off"
                required
            />
            <StyledInputDescription>
                What is your role allowed to do?
            </StyledInputDescription>
            <PermissionAccordion
                isInitiallyExpanded
                title="Global permissions"
                Icon={<UserIcon color="disabled" sx={{ mr: 1 }} />}
                permissions={permissions}
                checkedPermissions={checkedPermissions}
                onPermissionChange={(permission: IPermission) =>
                    handlePermissionChange(permission)
                }
                onCheckAll={onToggleAllPermissions}
                getRoleKey={(permission: {
                    id: number;
                    environment?: string;
                }) => permission.id.toString()}
                context="root"
            />
        </div>
    );
};
