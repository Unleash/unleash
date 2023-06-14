import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import { UpdateButton } from 'component/common/UpdateButton/UpdateButton';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { useRolesApi } from 'hooks/api/actions/useRolesApi/useRolesApi';
import { useRole } from 'hooks/api/getters/useRole/useRole';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import useToast from 'hooks/useToast';
import { useNavigate } from 'react-router-dom';
import useProjectRoleForm from '../hooks/useProjectRoleForm';
import ProjectRoleForm from '../ProjectRoleForm/ProjectRoleForm';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { GO_BACK } from 'constants/navigate';

const EditProjectRole = () => {
    const { uiConfig } = useUiConfig();
    const { setToastData, setToastApiError } = useToast();
    const roleId = useRequiredPathParam('id');
    const { role, refetch } = useRole(roleId);

    const navigate = useNavigate();
    const {
        roleName,
        roleDesc,
        permissions,
        checkedPermissions,
        errors,
        setRoleName,
        setRoleDesc,
        handlePermissionChange,
        onToggleAllProjectPermissions,
        onToggleAllEnvironmentPermissions,
        getProjectRolePayload,
        validatePermissions,
        validateName,
        clearErrors,
        getRoleKey,
    } = useProjectRoleForm(role?.name, role?.description, role?.permissions);

    const formatApiCode = () => {
        return `curl --location --request PUT '${
            uiConfig.unleashUrl
        }/api/admin/roles/${role?.id}' \\
--header 'Authorization: INSERT_API_KEY' \\
--header 'Content-Type: application/json' \\
--data-raw '${JSON.stringify(getProjectRolePayload(), undefined, 2)}'`;
    };

    const { updateRole, loading } = useRolesApi();

    const onSubmit = async (e: Event) => {
        e.preventDefault();
        const payload = getProjectRolePayload();

        const validName = validateName();
        const validPermissions = validatePermissions();

        if (validName && validPermissions) {
            try {
                await updateRole(+roleId, payload);
                refetch();
                navigate('/admin/project-roles');
                setToastData({
                    type: 'success',
                    title: 'Project role updated',
                    text: 'Your role changes will automatically be applied to the users with this role.',
                    confetti: true,
                });
            } catch (error: unknown) {
                setToastApiError(formatUnknownError(error));
            }
        }
    };

    const onCancel = () => {
        navigate(GO_BACK);
    };

    return (
        <FormTemplate
            loading={loading}
            title="Edit project role"
            description="A project role can be
customised to limit access
to resources within a project"
            documentationLink="https://docs.getunleash.io/reference/rbac#custom-project-roles"
            documentationLinkLabel="Project roles documentation"
            formatApiCode={formatApiCode}
        >
            <ProjectRoleForm
                permissions={permissions}
                onSubmit={onSubmit}
                onCancel={onCancel}
                roleName={roleName}
                setRoleName={setRoleName}
                roleDesc={roleDesc}
                setRoleDesc={setRoleDesc}
                checkedPermissions={checkedPermissions}
                handlePermissionChange={handlePermissionChange}
                checkAllProjectPermissions={onToggleAllProjectPermissions}
                checkAllEnvironmentPermissions={
                    onToggleAllEnvironmentPermissions
                }
                errors={errors}
                clearErrors={clearErrors}
                getRoleKey={getRoleKey}
            >
                <UpdateButton permission={ADMIN} />
            </ProjectRoleForm>
        </FormTemplate>
    );
};

export default EditProjectRole;
