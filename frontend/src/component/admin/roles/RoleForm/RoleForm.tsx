import { styled } from '@mui/material';
import Input from 'component/common/Input/Input';
import { PermissionAccordion } from 'component/admin/projectRoles/ProjectRoleForm/PermissionAccordion/PermissionAccordion';
import { Person as UserIcon } from '@mui/icons-material';
import { ICheckedPermissions, IPermission } from 'interfaces/permissions';
import { IRoleFormErrors } from './useRoleForm';
import { ROOT_PERMISSION_CATEGORIES } from '@server/types/permissions';
import { toggleAllPermissions, togglePermission } from 'utils/permissions';

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

    const onPermissionChange = (permission: IPermission) => {
        const newCheckedPermissions = togglePermission(
            checkedPermissions,
            permission
        );
        setCheckedPermissions(newCheckedPermissions);
    };

    const onCheckAll = (category: string) => {
        const categoryPermissions = categorizedPermissions
            .filter(({ category: pCategory }) => pCategory === category)
            .map(({ permission }) => permission);

        const newCheckedPermissions = toggleAllPermissions(
            checkedPermissions,
            categoryPermissions
        );

        setCheckedPermissions(newCheckedPermissions);
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
                    key={category}
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
                        onPermissionChange(permission)
                    }
                    onCheckAll={() => onCheckAll(category)}
                />
            ))}
        </div>
    );
};
