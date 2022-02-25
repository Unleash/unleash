import { useEffect } from 'react';

import FormTemplate from '../../../common/FormTemplate/FormTemplate';

import useProjectRolesApi from '../../../../hooks/api/actions/useProjectRolesApi/useProjectRolesApi';

import { useHistory, useParams } from 'react-router-dom';
import ProjectRoleForm from '../ProjectRoleForm/ProjectRoleForm';
import useProjectRoleForm from '../hooks/useProjectRoleForm';
import useProjectRole from '../../../../hooks/api/getters/useProjectRole/useProjectRole';
import { IPermission } from '../../../../interfaces/project';
import useUiConfig from '../../../../hooks/api/getters/useUiConfig/useUiConfig';
import useToast from '../../../../hooks/useToast';
import PermissionButton from '../../../common/PermissionButton/PermissionButton';
import { ADMIN } from '../../../providers/AccessProvider/permissions';
import { formatUnknownError } from '../../../../utils/format-unknown-error';

const EditProjectRole = () => {
    const { uiConfig } = useUiConfig();
    const { setToastData, setToastApiError } = useToast();

    const { id } = useParams<{ id: string }>();
    const { role } = useProjectRole(id);

    const history = useHistory();
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

    const { refetch } = useProjectRole(id);
    const { editRole, loading } = useProjectRolesApi();

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        const payload = getProjectRolePayload();

        const validName = validateName();
        const validPermissions = validatePermissions();

        if (validName && validPermissions) {
            try {
                await editRole(id, payload);
                refetch();
                history.push('/admin/roles');
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
        history.goBack();
    };

    return (
        <FormTemplate
            loading={loading}
            title="Edit project role"
            description="A project role can be
customised to limit access
to resources within a project"
            documentationLink="https://docs.getunleash.io/how-to/how-to-create-and-assign-custom-project-roles"
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
                <PermissionButton permission={ADMIN} type="submit">
                    Edit role
                </PermissionButton>
            </ProjectRoleForm>
        </FormTemplate>
    );
};

export default EditProjectRole;
