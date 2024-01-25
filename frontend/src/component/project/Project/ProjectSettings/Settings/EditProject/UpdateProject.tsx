import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import ProjectForm from '../../../ProjectForm/ProjectForm';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import {
    PROJECT_SETTINGS_WRITE,
    UPDATE_PROJECT,
} from 'component/providers/AccessProvider/permissions';
import useProjectForm, {
    DEFAULT_PROJECT_STICKINESS,
} from '../../../hooks/useProjectForm';
import { useDefaultProjectSettings } from 'hooks/useDefaultProjectSettings';
import { formatUnknownError } from 'utils/formatUnknownError';
import useToast from 'hooks/useToast';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import useProjectApi from 'hooks/api/actions/useProjectApi/useProjectApi';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { IProject } from 'interfaces/project';
import useProject from 'hooks/api/getters/useProject/useProject';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { styled } from '@mui/material';

const StyledContainer = styled('div')<{ isPro: boolean }>(
    ({ theme, isPro }) => ({
        minHeight: 0,
        borderRadius: theme.spacing(2),
        border: isPro ? '0' : `1px solid ${theme.palette.divider}`,
        width: '100%',
        display: 'flex',
        margin: '0 auto',
        overflow: 'hidden',
        [theme.breakpoints.down(1100)]: {
            flexDirection: 'column',
            minHeight: 0,
        },
    }),
);

const StyledFormContainer = styled('div')(({ theme }) => ({
    borderTop: `1px solid ${theme.palette.divider}`,
    paddingTop: theme.spacing(4),
}));

interface IUpdateProject {
    project: IProject;
}
const EDIT_PROJECT_BTN = 'EDIT_PROJECT_BTN';
export const UpdateProject = ({ project }: IUpdateProject) => {
    const id = useRequiredPathParam('projectId');
    const { uiConfig, isPro } = useUiConfig();
    const { setToastData, setToastApiError } = useToast();
    const { defaultStickiness } = useDefaultProjectSettings(id);
    const { trackEvent } = usePlausibleTracker();
    const {
        projectId,
        projectName,
        projectDesc,
        projectStickiness,
        featureLimit,
        setFeatureLimit,
        setProjectId,
        setProjectName,
        setProjectDesc,
        setProjectStickiness,
        getEditProjectPayload,
        clearErrors,
        validateProjectId,
        validateName,
        errors,
    } = useProjectForm(
        id,
        project.name,
        project.description,
        defaultStickiness,
        String(project.featureLimit),
    );

    const { editProject, loading } = useProjectApi();
    const { refetch } = useProject(id);

    const formatProjectApiCode = () => {
        return `curl --location --request PUT '${
            uiConfig.unleashUrl
        }/api/admin/projects/${id}' \\
--header 'Authorization: INSERT_API_KEY' \\
--header 'Content-Type: application/json' \\
--data-raw '${JSON.stringify(getEditProjectPayload(), undefined, 2)}'`;
    };

    const handleEditProject = async (e: Event) => {
        e.preventDefault();
        const payload = getEditProjectPayload();

        const validName = validateName();

        if (validName) {
            try {
                await editProject(id, payload);
                refetch();
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

    return (
        <StyledContainer isPro={isPro()}>
            <FormTemplate
                loading={loading}
                title='General settings'
                description='Projects allows you to group feature toggles together in the management UI.'
                documentationLink='https://docs.getunleash.io/reference/projects'
                documentationLinkLabel='Projects documentation'
                formatApiCode={formatProjectApiCode}
                compactPadding
                compact
            >
                <StyledFormContainer>
                    <ProjectForm
                        errors={errors}
                        handleSubmit={handleEditProject}
                        projectId={projectId}
                        setProjectId={setProjectId}
                        projectName={projectName}
                        setProjectName={setProjectName}
                        projectStickiness={projectStickiness}
                        setProjectStickiness={setProjectStickiness}
                        setFeatureLimit={setFeatureLimit}
                        featureLimit={featureLimit}
                        projectDesc={projectDesc}
                        setProjectDesc={setProjectDesc}
                        mode='Edit'
                        clearErrors={clearErrors}
                        validateProjectId={validateProjectId}
                    >
                        <PermissionButton
                            type='submit'
                            permission={[
                                UPDATE_PROJECT,
                                PROJECT_SETTINGS_WRITE,
                            ]}
                            projectId={projectId}
                            data-testid={EDIT_PROJECT_BTN}
                        >
                            Save changes
                        </PermissionButton>
                    </ProjectForm>
                </StyledFormContainer>
            </FormTemplate>
        </StyledContainer>
    );
};
