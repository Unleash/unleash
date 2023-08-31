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
import { useDefaultProjectSettings } from 'hooks/useDefaultProjectSettings';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import useProjectForm, {
    DEFAULT_PROJECT_STICKINESS,
} from '../../hooks/useProjectForm';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { DeleteProject } from './DeleteProject';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import ProjectForm from '../../ProjectForm/ProjectForm';

const EditProject = () => {
    const { uiConfig } = useUiConfig();
    const { setToastData, setToastApiError } = useToast();
    const { hasAccess } = useContext(AccessContext);
    const id = useRequiredPathParam('projectId');
    const { project } = useProject(id);
    const { defaultStickiness } = useDefaultProjectSettings(id);
    const { trackEvent } = usePlausibleTracker();

    const {
        projectId,
        projectName,
        projectDesc,
        projectStickiness,
        projectMode,
        featureLimit,
        featureNamingPattern,
        featureNamingExample,
        setProjectId,
        setProjectName,
        setProjectDesc,
        setProjectStickiness,
        setProjectMode,
        setFeatureLimit,
        setFeatureNamingPattern,
        setFeatureNamingExample,
        getProjectPayload,
        clearErrors,
        validateProjectId,
        validateName,
        errors,
    } = useProjectForm(
        id,
        project.name,
        project.description,
        defaultStickiness,
        project.mode,
        project.featureLimit ? String(project.featureLimit) : '',
        project.featureNaming?.pattern || '',
        project.featureNaming?.example || ''
    );

    const formatApiCode = () => {
        return `curl --location --request PUT '${
            uiConfig.unleashUrl
        }/api/admin/projects/${id}' \\
--header 'Authorization: INSERT_API_KEY' \\
--header 'Content-Type: application/json' \\
--data-raw '${JSON.stringify(getProjectPayload(), undefined, 2)}'`;
    };

    const { editProject, loading } = useProjectApi();

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        const payload = getProjectPayload();

        const validName = validateName();

        if (validName) {
            try {
                await editProject(id, payload);
                setToastData({
                    title: 'Project information updated',
                    type: 'success',
                });
                if (projectStickiness !== DEFAULT_PROJECT_STICKINESS) {
                    trackEvent('project_stickiness_set');
                }
            } catch (error: unknown) {
                setToastApiError(formatUnknownError(error));
            }
        }
    };

    const accessDeniedAlert = !hasAccess(UPDATE_PROJECT, projectId) && (
        <Alert severity="error" sx={{ mb: 4 }}>
            You do not have the required permissions to edit this project.
        </Alert>
    );

    return (
        <FormTemplate
            loading={loading}
            disablePadding={true}
            description="Projects allows you to group feature toggles together in the management UI."
            documentationLink="https://docs.getunleash.io/reference/projects"
            documentationLinkLabel="Projects documentation"
            formatApiCode={formatApiCode}
        >
            {accessDeniedAlert}
            <PageContent header={<PageHeader title="Settings" />}>
                <ProjectForm
                    errors={errors}
                    handleSubmit={handleSubmit}
                    projectId={projectId}
                    setProjectId={setProjectId}
                    projectName={projectName}
                    projectMode={projectMode}
                    featureLimit={featureLimit}
                    featureCount={project.features.length}
                    featureNamingPattern={featureNamingPattern}
                    featureNamingExample={featureNamingExample}
                    setProjectName={setProjectName}
                    projectStickiness={projectStickiness}
                    setProjectStickiness={setProjectStickiness}
                    setProjectMode={setProjectMode}
                    setProjectNamingPattern={setFeatureNamingPattern}
                    setFeatureNamingExample={setFeatureNamingExample}
                    projectDesc={projectDesc}
                    mode="Edit"
                    setProjectDesc={setProjectDesc}
                    setFeatureLimit={setFeatureLimit}
                    clearErrors={clearErrors}
                    validateProjectId={validateProjectId}
                >
                    <PermissionButton
                        type="submit"
                        permission={UPDATE_PROJECT}
                        projectId={projectId}
                    >
                        Save changes
                    </PermissionButton>
                </ProjectForm>
                <DeleteProject
                    projectId={projectId}
                    featureCount={project.features.length}
                />
            </PageContent>
        </FormTemplate>
    );
};

export default EditProject;
