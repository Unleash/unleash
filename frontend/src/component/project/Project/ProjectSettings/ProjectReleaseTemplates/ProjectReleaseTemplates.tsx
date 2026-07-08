import { PageContent } from 'component/common/PageContent/PageContent';
import Grid from '@mui/material/Grid';
import { styles as themeStyles } from 'component/common';
import { usePageTitle } from 'hooks/usePageTitle';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import Add from '@mui/icons-material/Add';
import ResponsiveButton from 'component/common/ResponsiveButton/ResponsiveButton';
import { useNavigate } from 'react-router';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useProjectOverviewNameOrId } from 'hooks/api/getters/useProjectOverview/useProjectOverview';
import { useProjectReleasePlanTemplates } from 'hooks/api/getters/useProjectReleasePlanTemplates/useProjectReleasePlanTemplates';
import { EmptyTemplatesListMessage } from 'component/releases/ReleaseManagement/EmptyTemplatesListMessage';
import { ReleasePlanTemplateList } from 'component/releases/ReleaseManagement/ReleasePlanTemplateList';
import {
    RELEASE_PLAN_TEMPLATE_CREATE,
    UPDATE_PROJECT_RELEASE_TEMPLATE,
} from '@server/types/permissions';

export const ProjectReleaseTemplates = () => {
    const projectId = useRequiredPathParam('projectId');
    const projectName = useProjectOverviewNameOrId(projectId);
    const navigate = useNavigate();
    const { projectTemplates } = useProjectReleasePlanTemplates(projectId);

    usePageTitle(`Project release templates – ${projectName}`);

    const createPath = `/projects/${projectId}/settings/release-templates/create-template`;

    return (
        <PageContent
            header={
                <PageHeader
                    title='Release templates'
                    actions={
                        <ResponsiveButton
                            Icon={Add}
                            onClick={() => {
                                navigate(createPath);
                            }}
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
            {projectTemplates.length > 0 ? (
                <Grid container spacing={2}>
                    <ReleasePlanTemplateList
                        templates={projectTemplates}
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
        </PageContent>
    );
};
