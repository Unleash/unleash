import { PageContent } from 'component/common/PageContent/PageContent';
import { styles as themeStyles } from 'component/common';
import { usePageTitle } from 'hooks/usePageTitle';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import Add from '@mui/icons-material/Add';
import ResponsiveButton from 'component/common/ResponsiveButton/ResponsiveButton';
import { useNavigate } from 'react-router';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useProjectOverviewNameOrId } from 'hooks/api/getters/useProjectOverview/useProjectOverview';
import { EmptyTemplatesListMessage } from 'component/releases/ReleaseManagement/EmptyTemplatesListMessage';
import { RELEASE_PLAN_TEMPLATE_CREATE } from '@server/types/permissions';

export const ProjectReleaseTemplates = () => {
    const projectId = useRequiredPathParam('projectId');
    const projectName = useProjectOverviewNameOrId(projectId);
    const navigate = useNavigate();

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
                            permission={RELEASE_PLAN_TEMPLATE_CREATE}
                        >
                            New template
                        </ResponsiveButton>
                    }
                />
            }
        >
            <div className={themeStyles.fullwidth}>
                <EmptyTemplatesListMessage createPath={createPath} />
            </div>
        </PageContent>
    );
};
