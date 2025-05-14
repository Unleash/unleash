import { Alert, styled } from '@mui/material';
import Input from 'component/common/Input/Input';
import type { ICheckedPermissions } from 'interfaces/permissions';
import type { IRoleFormErrors } from './useRoleForm.ts';
import type { PredefinedRoleType } from 'interfaces/role';
import { ROOT_ROLE_TYPE } from '@server/util/constants';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { RolePermissionCategories } from './RolePermissionCategories/RolePermissionCategories.tsx';

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
    setName: (name: string) => void;
    validateName: (name: string) => boolean;
    description: string;
    setDescription: (description: string) => void;
    validateDescription: (description: string) => boolean;
    checkedPermissions: ICheckedPermissions;
    setCheckedPermissions: React.Dispatch<
        React.SetStateAction<ICheckedPermissions>
    >;
    validatePermissions: (permissions: ICheckedPermissions) => boolean;
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
    validatePermissions,
}: IRoleFormProps) => {
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
                onChange={(e) => {
                    validateName(e.target.value);
                    setName(e.target.value);
                }}
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
                onChange={(e) => {
                    validateDescription(e.target.value);
                    setDescription(e.target.value);
                }}
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
            <RolePermissionCategories
                type={type}
                checkedPermissions={checkedPermissions}
                setCheckedPermissions={setCheckedPermissions}
                validatePermissions={validatePermissions}
            />
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
