import {
    PROJECT_SETTINGS_WRITE,
    UPDATE_PROJECT,
} from 'component/providers/AccessProvider/permissions';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useContext } from 'react';
import AccessContext from 'contexts/AccessContext';
import { Alert, styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { UpdateEnterpriseSettings } from './UpdateEnterpriseSettings.tsx';
import { UpdateProject } from './UpdateProject.tsx';
import useProjectOverview, {
    featuresCount,
} from 'hooks/api/getters/useProjectOverview/useProjectOverview';
import { ArchiveProjectForm } from './ArchiveProjectForm.tsx';

const StyledFormContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
}));

const EditProject = () => {
    const { isEnterprise } = useUiConfig();
    const { hasAccess } = useContext(AccessContext);
    const id = useRequiredPathParam('projectId');
    const { project } = useProjectOverview(id);

    if (!project.name) {
        return null;
    }

    const accessDeniedAlert = !hasAccess(
        [UPDATE_PROJECT, PROJECT_SETTINGS_WRITE],
        id,
    ) && (
        <Alert severity='error' sx={{ mb: 4 }}>
            You do not have the required permissions to edit this project.
        </Alert>
    );

    return (
        <>
            {accessDeniedAlert}
            <StyledFormContainer>
                <UpdateProject project={project} />
                <ConditionallyRender
                    condition={isEnterprise()}
                    show={<UpdateEnterpriseSettings project={project} />}
                />
                <ArchiveProjectForm
                    featureCount={featuresCount(project) ?? 0}
                />
            </StyledFormContainer>
        </>
    );
};

export default EditProject;
