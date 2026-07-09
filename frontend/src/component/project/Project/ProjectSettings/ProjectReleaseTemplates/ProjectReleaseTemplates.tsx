import { PageContent } from 'component/common/PageContent/PageContent';
import Grid from '@mui/material/Grid';
import { styles as themeStyles } from 'component/common';
import { usePageTitle } from 'hooks/usePageTitle';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import Add from '@mui/icons-material/Add';
import ResponsiveButton from 'component/common/ResponsiveButton/ResponsiveButton';
import { Route, Routes, useNavigate } from 'react-router';
import { SidebarModal } from 'component/common/SidebarModal/SidebarModal';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useProjectOverviewNameOrId } from 'hooks/api/getters/useProjectOverview/useProjectOverview';
import { useReleasePlanTemplates } from 'hooks/api/getters/useReleasePlanTemplates/useReleasePlanTemplates';
import { EmptyTemplatesListMessage } from 'component/releases/ReleaseManagement/EmptyTemplatesListMessage';
import { ReleasePlanTemplateList } from 'component/releases/ReleaseManagement/ReleasePlanTemplateList';
import { CreateReleasePlanTemplate } from 'component/releases/ReleasePlanTemplate/CreateReleasePlanTemplate';
import { EditReleasePlanTemplate } from 'component/releases/ReleasePlanTemplate/EditReleasePlanTemplate';
import { formatReleaseTemplateListPath } from 'component/releases/releaseTemplatePaths';
import {
    RELEASE_PLAN_TEMPLATE_CREATE,
    UPDATE_PROJECT_RELEASE_TEMPLATE,
} from '@server/types/permissions';

export const ProjectReleaseTemplates = () => {
    const projectId = useRequiredPathParam('projectId');
    const projectName = useProjectOverviewNameOrId(projectId);
    const navigate = useNavigate();
    const { templates } = useReleasePlanTemplates(projectId);

    usePageTitle(`Project release templates – ${projectName}`);

    const listPath = formatReleaseTemplateListPath(projectId);
    const createPath = `${listPath}/create-template`;
    const closeModal = () => navigate(listPath);

    return (
        <PageContent
            header={
                <PageHeader
                    title='Release templates'
                    actions={
                        <ResponsiveButton
                            Icon={Add}
                            onClick={() => navigate(createPath)}
                            maxWidth='700px'
                            permission={[
                                RELEASE_PLAN_TEMPLATE_CREATE,
                                UPDATE_PROJECT_RELEASE_TEMPLATE,
                            ]}
                            projectId={projectId}
                        >
                            New template
                        </ResponsiveButton>
                    }
                />
            }
        >
            {templates.length > 0 ? (
                <Grid container spacing={2}>
                    <ReleasePlanTemplateList
                        templates={templates}
                        projectId={projectId}
                    />
                </Grid>
            ) : (
                <div className={themeStyles.fullwidth}>
                    <EmptyTemplatesListMessage
                        createPath={createPath}
                        projectId={projectId}
                    />
                </div>
            )}

            <Routes>
                <Route
                    path='create-template'
                    element={
                        <SidebarModal
                            open
                            onClose={closeModal}
                            label='Create release template'
                        >
                            <CreateReleasePlanTemplate modal />
                        </SidebarModal>
                    }
                />
                <Route
                    path='edit/:templateId'
                    element={
                        <SidebarModal
                            open
                            onClose={closeModal}
                            label='Edit release template'
                        >
                            <EditReleasePlanTemplate modal />
                        </SidebarModal>
                    }
                />
            </Routes>
        </PageContent>
    );
};
