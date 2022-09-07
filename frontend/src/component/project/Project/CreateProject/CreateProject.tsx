import { useNavigate } from 'react-router-dom';
import ProjectForm from '../ProjectForm/ProjectForm';
import useProjectForm from '../hooks/useProjectForm';
import { CreateButton } from 'component/common/CreateButton/CreateButton';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import { CREATE_PROJECT } from 'component/providers/AccessProvider/permissions';
import useProjectApi from 'hooks/api/actions/useProjectApi/useProjectApi';
import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { GO_BACK } from 'constants/navigate';

const CreateProject = () => {
    const { setToastData, setToastApiError } = useToast();
    const { refetchUser } = useAuthUser();
    const { uiConfig } = useUiConfig();
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
    } = useProjectForm();

    const { createProject, loading } = useProjectApi();

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        clearErrors();
        const validName = validateName();
        const validId = await validateProjectId();

        if (validName && validId) {
            const payload = getProjectPayload();
            try {
                await createProject(payload);
                refetchUser();
                navigate(`/projects/${projectId}`);
                setToastData({
                    title: 'Project created',
                    text: 'Now you can add toggles to this project',
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
        }/api/admin/projects' \\
--header 'Authorization: INSERT_API_KEY' \\
--header 'Content-Type: application/json' \\
--data-raw '${JSON.stringify(getProjectPayload(), undefined, 2)}'`;
    };

    const handleCancel = () => {
        navigate(GO_BACK);
    };

    return (
        <FormTemplate
            loading={loading}
            title="Create project"
            description="Projects allows you to group feature toggles together in the management UI."
            documentationLink="https://docs.getunleash.io/user_guide/projects"
            documentationLinkLabel="Projects documentation"
            formatApiCode={formatApiCode}
        >
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
                mode="Create"
                clearErrors={clearErrors}
                validateProjectId={validateProjectId}
            >
                <CreateButton name="project" permission={CREATE_PROJECT} />
            </ProjectForm>
        </FormTemplate>
    );
};

export default CreateProject;
