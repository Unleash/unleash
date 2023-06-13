import { styled } from '@mui/material';
import Input from 'component/common/Input/Input';
import { PermissionAccordion } from 'component/admin/projectRoles/ProjectRoleForm/PermissionAccordion/PermissionAccordion';
import { Person as UserIcon } from '@mui/icons-material';
import { ICheckedPermissions, IPermission } from 'interfaces/permissions';
import { IRoleFormErrors } from './useRoleForm';
import { ROOT_PERMISSION_CATEGORIES } from '@server/types/permissions';
import cloneDeep from 'lodash.clonedeep';

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
    setCheckedPermissions: React.Dispatch<
        React.SetStateAction<ICheckedPermissions>
    >;
    handlePermissionChange: (permission: IPermission) => void;
    permissions: IPermission[];
    errors: IRoleFormErrors;
}

export const RoleForm = ({
    name,
    onSetName,
    description,
    setDescription,
    checkedPermissions,
    setCheckedPermissions,
    handlePermissionChange,
    permissions,
    errors,
}: IRoleFormProps) => {
    const categorizedPermissions = permissions.map(permission => {
        const category = ROOT_PERMISSION_CATEGORIES.find(category =>
            category.permissions.includes(permission.name)
        );

        return {
            category: category ? category.label : 'Other',
            permission,
        };
    });

    const categories = new Set(
        categorizedPermissions.map(({ category }) => category).sort()
    );

    const onToggleAllPermissions = (category: string) => {
        let checkedPermissionsCopy = cloneDeep(checkedPermissions);

        const categoryPermissions = categorizedPermissions
            .filter(({ category: pCategory }) => pCategory === category)
            .map(({ permission }) => permission);

        const allChecked = categoryPermissions.every(
            (permission: IPermission) => checkedPermissionsCopy[permission.id]
        );

        if (allChecked) {
            categoryPermissions.forEach((permission: IPermission) => {
                delete checkedPermissionsCopy[permission.id];
            });
        } else {
            categoryPermissions.forEach((permission: IPermission) => {
                checkedPermissionsCopy[permission.id] = {
                    ...permission,
                };
            });
        }

        setCheckedPermissions(checkedPermissionsCopy);
    };

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
            {[...categories].map(category => (
                <PermissionAccordion
                    title={`${category} permissions`}
                    context={category.toLowerCase()}
                    Icon={<UserIcon color="disabled" sx={{ mr: 1 }} />}
                    permissions={categorizedPermissions
                        .filter(
                            ({ category: pCategory }) => pCategory === category
                        )
                        .map(({ permission }) => permission)}
                    checkedPermissions={checkedPermissions}
                    onPermissionChange={(permission: IPermission) =>
                        handlePermissionChange(permission)
                    }
                    onCheckAll={() => onToggleAllPermissions(category)}
                />
            ))}
        </div>
    );
};
