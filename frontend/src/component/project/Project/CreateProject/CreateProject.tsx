import FormTemplate from '../../../common/FormTemplate/FormTemplate';
import useProjectApi from '../../../../hooks/api/actions/useProjectApi/useProjectApi';
import { useHistory } from 'react-router-dom';
import ProjectForm from '../ProjectForm/ProjectForm';
import useProjectForm from '../hooks/useProjectForm';
import useUiConfig from '../../../../hooks/api/getters/useUiConfig/useUiConfig';
import useToast from '../../../../hooks/useToast';
import useUser from '../../../../hooks/api/getters/useUser/useUser';
import PermissionButton from '../../../common/PermissionButton/PermissionButton';
import { CREATE_PROJECT } from '../../../providers/AccessProvider/permissions';

const CreateProject = () => {
    const { setToastData, setToastApiError } = useToast();
    const { refetch } = useUser();
    const { uiConfig } = useUiConfig();
    const history = useHistory();
    const {
        projectId,
        projectName,
        projectDesc,
        setProjectId,
        setProjectName,
        setProjectDesc,
        getProjectPayload,
        clearErrors,
        validateIdUniqueness,
        validateName,
        errors,
    } = useProjectForm();

    const { createProject, loading } = useProjectApi();

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        clearErrors();
        const validName = validateName();
        const validId = await validateIdUniqueness();

        if (validName && validId) {
            const payload = getProjectPayload();
            try {
                await createProject(payload);
                refetch();
                history.push(`/projects/${projectId}`);
                setToastData({
                    title: 'Project created',
                    text: 'Now you can add toggles to this project',
                    confetti: true,
                    type: 'success',
                });
            } catch (e: any) {
                setToastApiError(e.toString());
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
        history.goBack();
    };

    return (
        <FormTemplate
            loading={loading}
            title="Create project"
            description="Projects allows you to group feature toggles together in the management UI."
            documentationLink="https://docs.getunleash.io/user_guide/projects"
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
                validateIdUniqueness={validateIdUniqueness}
            >
                <PermissionButton permission={CREATE_PROJECT} type="submit">
                    Create project
                </PermissionButton>
            </ProjectForm>
        </FormTemplate>
    );
};

export default CreateProject;
