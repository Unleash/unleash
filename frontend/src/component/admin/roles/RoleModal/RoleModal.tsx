import { Button, styled } from '@mui/material';
import { SidebarModal } from 'component/common/SidebarModal/SidebarModal';
import { useRoleForm } from '../RoleForm/useRoleForm';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import { RoleForm } from '../RoleForm/RoleForm';
import { useRoles } from 'hooks/api/getters/useRoles/useRoles';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { FormEvent } from 'react';
import { useRolesApi } from 'hooks/api/actions/useRolesApi/useRolesApi';
import { useRole } from 'hooks/api/getters/useRole/useRole';
import { PredefinedRoleType } from 'interfaces/role';
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
        description,
        setDescription,
        checkedPermissions,
        setCheckedPermissions,
        getRolePayload,
        isNameUnique,
        isNotEmpty,
        hasPermissions,
        errors,
        setError,
        clearError,
        ErrorField,
    } = useRoleForm(role?.name, role?.description, role?.permissions);
    const { refetch: refetchRoles } = useRoles();
    const { addRole, updateRole, loading } = useRolesApi();
    const { setToastData, setToastApiError } = useToast();
    const { uiConfig } = useUiConfig();

    const editing = role !== undefined;
    const isValid =
        isNameUnique(name) &&
        isNotEmpty(name) &&
        isNotEmpty(description) &&
        hasPermissions(checkedPermissions);

    const payload = getRolePayload(type);

    const formatApiCode = () => {
        return `curl --location --request ${editing ? 'PUT' : 'POST'} '${
            uiConfig.unleashUrl
        }/api/admin/roles${editing ? `/${role.id}` : ''}' \\
    --header 'Authorization: INSERT_API_KEY' \\
    --header 'Content-Type: application/json' \\
    --data-raw '${JSON.stringify(payload, undefined, 2)}'`;
    };

    const onSetName = (name: string) => {
        clearError(ErrorField.NAME);
        if (!isNameUnique(name)) {
            setError(ErrorField.NAME, 'A role with that name already exists.');
        }
        setName(name);
    };

    const refetch = () => {
        refetchRoles();
        refetchRole();
    };

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!isValid) return;

        try {
            if (editing) {
                await updateRole(role.id, payload);
            } else {
                await addRole(payload);
            }
            setToastData({
                title: `Role ${editing ? 'updated' : 'added'} successfully`,
                type: 'success',
            });
            refetch();
            setOpen(false);
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

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
                documentationLink="https://docs.getunleash.io/reference/rbac"
                documentationLinkLabel="Roles documentation"
                formatApiCode={formatApiCode}
            >
                <StyledForm onSubmit={onSubmit}>
                    <RoleForm
                        type={type}
                        name={name}
                        onSetName={onSetName}
                        description={description}
                        setDescription={setDescription}
                        checkedPermissions={checkedPermissions}
                        setCheckedPermissions={setCheckedPermissions}
                        errors={errors}
                    />
                    <StyledButtonContainer>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={!isValid}
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
