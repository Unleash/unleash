import { useNavigate } from 'react-router-dom';
import ProjectForm from '../ProjectForm/ProjectForm';
import useProjectForm from '../hooks/useProjectForm';
import { UpdateButton } from 'component/common/UpdateButton/UpdateButton';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import { UPDATE_PROJECT } from 'component/providers/AccessProvider/permissions';
import useProjectApi from 'hooks/api/actions/useProjectApi/useProjectApi';
import useProject from 'hooks/api/getters/useProject/useProject';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useContext } from 'react';
import AccessContext from 'contexts/AccessContext';
import { Alert } from '@mui/material';
import { GO_BACK } from 'constants/navigate';

const EditProject = () => {
    const { uiConfig } = useUiConfig();
    const { setToastData, setToastApiError } = useToast();
    const { hasAccess } = useContext(AccessContext);
    const id = useRequiredPathParam('projectId');
    const { project } = useProject(id);
    const navigate = useNavigate();

    const {
        projectId,
        projectName,
        projectDesc,
        setProjectId,
        setProjectName,
        setProjectDesc,
        getProjectPayload,
        clearErrors,
        validateProjectId,
        validateName,
        errors,
    } = useProjectForm(id, project.name, project.description);

    const formatApiCode = () => {
        return `curl --location --request PUT '${
            uiConfig.unleashUrl
        }/api/admin/projects/${id}' \\
--header 'Authorization: INSERT_API_KEY' \\
--header 'Content-Type: application/json' \\
--data-raw '${JSON.stringify(getProjectPayload(), undefined, 2)}'`;
    };

    const { refetch } = useProject(id);
    const { editProject, loading } = useProjectApi();

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        const payload = getProjectPayload();

        const validName = validateName();

        if (validName) {
            try {
                await editProject(id, payload);
                refetch();
                navigate(`/projects/${id}`);
                setToastData({
                    title: 'Project information updated',
                    type: 'success',
                });
            } catch (error: unknown) {
                setToastApiError(formatUnknownError(error));
            }
        }
    };

    const handleCancel = () => {
        navigate(GO_BACK);
    };

    const accessDeniedAlert = !hasAccess(UPDATE_PROJECT, projectId) && (
        <Alert severity="error" sx={{ mb: 4 }}>
            You do not have the required permissions to edit this project.
        </Alert>
    );

    return (
        <FormTemplate
            loading={loading}
            title="Edit project"
            description="Projects allows you to group feature toggles together in the management UI."
            documentationLink="https://docs.getunleash.io/user_guide/projects"
            documentationLinkLabel="Projects documentation"
            formatApiCode={formatApiCode}
        >
            {accessDeniedAlert}
            <ProjectForm
                errors={errors}
                handleSubmit={handleSubmit}
                handleCancel={handleCancel}
                projectId={projectId}
                setProjectId={setProjectId}
                projectName={projectName}
                setProjectName={setProjectName}
                projectDesc={projectDesc}
                setProjectDesc={setProjectDesc}
                mode="Edit"
                clearErrors={clearErrors}
                validateProjectId={validateProjectId}
            >
                <UpdateButton
                    permission={UPDATE_PROJECT}
                    projectId={projectId}
                />
            </ProjectForm>
        </FormTemplate>
    );
};

export default EditProject;
