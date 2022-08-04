import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import useProjectRolesApi from 'hooks/api/actions/useProjectRolesApi/useProjectRolesApi';
import { useNavigate } from 'react-router-dom';
import ProjectRoleForm from '../ProjectRoleForm/ProjectRoleForm';
import useProjectRoleForm from '../hooks/useProjectRoleForm';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import useToast from 'hooks/useToast';
import { CreateButton } from 'component/common/CreateButton/CreateButton';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { formatUnknownError } from 'utils/formatUnknownError';
import { GO_BACK } from 'constants/navigate';

const CreateProjectRole = () => {
    const { setToastData, setToastApiError } = useToast();
    const { uiConfig } = useUiConfig();
    const navigate = useNavigate();
    const {
        roleName,
        roleDesc,
        setRoleName,
        setRoleDesc,
        checkedPermissions,
        handlePermissionChange,
        checkAllProjectPermissions,
        checkAllEnvironmentPermissions,
        getProjectRolePayload,
        validatePermissions,
        validateName,
        validateNameUniqueness,
        errors,
        clearErrors,
        getRoleKey,
    } = useProjectRoleForm();

    const { createRole, loading } = useProjectRolesApi();

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        clearErrors();
        const validName = validateName();
        const validPermissions = validatePermissions();

        if (validName && validPermissions) {
            const payload = getProjectRolePayload();
            try {
                await createRole(payload);
                navigate('/admin/roles');
                setToastData({
                    title: 'Project role created',
                    text: 'Now you can start assigning your project roles to project members.',
                    confetti: true,
                    type: 'success',
                });
            } catch (error: unknown) {
                setToastApiError(formatUnknownError(error));
            }
        }
    };

    const formatApiCode = () => {
        return `curl --location --request POST '${
            uiConfig.unleashUrl
        }/api/admin/roles' \\
--header 'Authorization: INSERT_API_KEY' \\
--header 'Content-Type: application/json' \\
--data-raw '${JSON.stringify(getProjectRolePayload(), undefined, 2)}'`;
    };

    const handleCancel = () => {
        navigate(GO_BACK);
    };

    return (
        <FormTemplate
            loading={loading}
            title="Create project role"
            description="A project role can be
            customised to limit access
            to resources within a project"
            documentationLink="https://docs.getunleash.io/user_guide/rbac#custom-project-roles"
            documentationLinkLabel="Project roles documentation"
            formatApiCode={formatApiCode}
        >
            <ProjectRoleForm
                errors={errors}
                handleSubmit={handleSubmit}
                handleCancel={handleCancel}
                roleName={roleName}
                setRoleName={setRoleName}
                roleDesc={roleDesc}
                setRoleDesc={setRoleDesc}
                checkedPermissions={checkedPermissions}
                handlePermissionChange={handlePermissionChange}
                checkAllProjectPermissions={checkAllProjectPermissions}
                checkAllEnvironmentPermissions={checkAllEnvironmentPermissions}
                mode="Create"
                clearErrors={clearErrors}
                validateNameUniqueness={validateNameUniqueness}
                getRoleKey={getRoleKey}
            >
                <CreateButton name="role" permission={ADMIN} />
            </ProjectRoleForm>
        </FormTemplate>
    );
};

export default CreateProjectRole;
