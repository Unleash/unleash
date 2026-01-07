import { Button, styled } from '@mui/material';
import { SidebarModal } from 'component/common/SidebarModal/SidebarModal';
import { useRoleForm } from '../RoleForm/useRoleForm.ts';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import { RoleForm } from '../RoleForm/RoleForm.tsx';
import { useRoles } from 'hooks/api/getters/useRoles/useRoles';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { type FormEvent, useEffect } from 'react';
import { useRolesApi } from 'hooks/api/actions/useRolesApi/useRolesApi';
import { useRole } from 'hooks/api/getters/useRole/useRole';
import type { PredefinedRoleType } from 'interfaces/role';
import { ROOT_ROLE_TYPE } from '@server/util/constants';

const StyledForm = styled('form')(() => ({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
}));

const StyledButtonContainer = styled('div')(({ theme }) => ({
    marginTop: 'auto',
    display: 'flex',
    justifyContent: 'flex-end',
    paddingTop: theme.spacing(4),
}));

const StyledCancelButton = styled(Button)(({ theme }) => ({
    marginLeft: theme.spacing(3),
}));

interface IRoleModalProps {
    type?: PredefinedRoleType;
    roleId?: number;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const RoleModal = ({
    type = ROOT_ROLE_TYPE,
    roleId,
    open,
    setOpen,
}: IRoleModalProps) => {
    const { role, refetch: refetchRole } = useRole(roleId?.toString());

    const {
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
        reload: reloadForm,
    } = useRoleForm(role?.name, role?.description, role?.permissions);
    const { refetch: refetchRoles } = useRoles();
    const { addRole, updateRole, loading } = useRolesApi();
    const { setToastData, setToastApiError } = useToast();
    const { uiConfig } = useUiConfig();

    const editing = role !== undefined;

    const payload = getRolePayload(type);

    const formatApiCode = () => {
        return `curl --location --request ${editing ? 'PUT' : 'POST'} '${
            uiConfig.unleashUrl
        }/api/admin/roles${editing ? `/${role.id}` : ''}' \\
    --header 'Authorization: INSERT_API_KEY' \\
    --header 'Content-Type: application/json' \\
    --data-raw '${JSON.stringify(payload, undefined, 2)}'`;
    };

    const refetch = () => {
        refetchRoles();
        refetchRole();
    };

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validate()) return;

        try {
            if (editing) {
                await updateRole(role.id, payload);
            } else {
                await addRole(payload);
            }
            setToastData({
                text: `Role ${editing ? 'updated' : 'added'} successfully`,
                type: 'success',
            });
            refetch();
            setOpen(false);
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    useEffect(() => {
        reloadForm();
    }, [open]);

    const titleCasedType = type[0].toUpperCase() + type.slice(1);

    return (
        <SidebarModal
            open={open}
            onClose={() => {
                setOpen(false);
            }}
            label={editing ? `Edit ${type} role` : `New ${type} role`}
        >
            <FormTemplate
                loading={loading}
                modal
                title={editing ? `Edit ${type} role` : `New ${type} role`}
                description={`${titleCasedType} roles allow you to control access to ${type} resources. Besides the built-in ${type} roles, you can create and manage custom ${type} roles to fit your needs.`}
                documentationLink={`https://docs.getunleash.io/concepts/rbac${
                    type === ROOT_ROLE_TYPE
                        ? '#custom-root-roles'
                        : '#custom-project-roles'
                }`}
                documentationLinkLabel='Roles documentation'
                formatApiCode={formatApiCode}
            >
                <StyledForm onSubmit={onSubmit}>
                    <RoleForm
                        type={type}
                        name={name}
                        setName={setName}
                        validateName={validateName}
                        description={description}
                        setDescription={setDescription}
                        validateDescription={validateDescription}
                        checkedPermissions={checkedPermissions}
                        setCheckedPermissions={setCheckedPermissions}
                        validatePermissions={validatePermissions}
                        errors={errors}
                        showErrors={showErrors}
                    />
                    <StyledButtonContainer>
                        <Button
                            type='submit'
                            variant='contained'
                            color='primary'
                        >
                            {editing ? 'Save' : 'Add'} role
                        </Button>
                        <StyledCancelButton
                            onClick={() => {
                                setOpen(false);
                            }}
                        >
                            Cancel
                        </StyledCancelButton>
                    </StyledButtonContainer>
                </StyledForm>
            </FormTemplate>
        </SidebarModal>
    );
};
