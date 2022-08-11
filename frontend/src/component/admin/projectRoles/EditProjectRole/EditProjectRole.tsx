import { useEffect } from 'react';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import { UpdateButton } from 'component/common/UpdateButton/UpdateButton';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import useProjectRolesApi from 'hooks/api/actions/useProjectRolesApi/useProjectRolesApi';
import useProjectRole from 'hooks/api/getters/useProjectRole/useProjectRole';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import useToast from 'hooks/useToast';
import { IPermission } from 'interfaces/project';
import { useNavigate } from 'react-router-dom';
import useProjectRoleForm from '../hooks/useProjectRoleForm';
import ProjectRoleForm from '../ProjectRoleForm/ProjectRoleForm';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { GO_BACK } from 'constants/navigate';

const EditProjectRole = () => {
    const { uiConfig } = useUiConfig();
    const { setToastData, setToastApiError } = useToast();
    const projectId = useRequiredPathParam('id');
    const { role } = useProjectRole(projectId);

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
        errors,
        clearErrors,
        getRoleKey,
        handleInitialCheckedPermissions,
        permissions,
    } = useProjectRoleForm(role.name, role.description);

    useEffect(() => {
        const initialCheckedPermissions = role?.permissions?.reduce(
            (acc: { [key: string]: IPermission }, curr: IPermission) => {
                acc[getRoleKey(curr)] = curr;
                return acc;
            },
            {}
        );

        handleInitialCheckedPermissions(initialCheckedPermissions || {});
        /* eslint-disable-next-line */
    }, [
        role?.permissions?.length,
        permissions?.project?.length,
        permissions?.environments?.length,
    ]);

    const formatApiCode = () => {
        return `curl --location --request PUT '${
            uiConfig.unleashUrl
        }/api/admin/roles/${role.id}' \\
--header 'Authorization: INSERT_API_KEY' \\
--header 'Content-Type: application/json' \\
--data-raw '${JSON.stringify(getProjectRolePayload(), undefined, 2)}'`;
    };

    const { refetch } = useProjectRole(projectId);
    const { editRole, loading } = useProjectRolesApi();

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        const payload = getProjectRolePayload();

        const validName = validateName();
        const validPermissions = validatePermissions();

        if (validName && validPermissions) {
            try {
                await editRole(projectId, payload);
                refetch();
                navigate('/admin/roles');
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

    const handleCancel = () => {
        navigate(GO_BACK);
    };

    return (
        <FormTemplate
            loading={loading}
            title="Edit project role"
            description="A project role can be
customised to limit access
to resources within a project"
            documentationLink="https://docs.getunleash.io/user_guide/rbac#custom-project-roles"
            documentationLinkLabel="Project roles documentation"
            formatApiCode={formatApiCode}
        >
            <ProjectRoleForm
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
                mode="Edit"
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
