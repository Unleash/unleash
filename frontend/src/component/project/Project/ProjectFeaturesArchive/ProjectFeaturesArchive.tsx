import { ProjectFeaturesArchiveTable } from 'component/archive/ProjectFeaturesArchiveTable';
import { usePageTitle } from 'hooks/usePageTitle';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useProjectOverviewNameOrId } from 'hooks/api/getters/useProjectOverview/useProjectOverview';

export const ProjectFeaturesArchive = () => {
    const projectId = useRequiredPathParam('projectId');
    const projectName = useProjectOverviewNameOrId(projectId);
    usePageTitle(`Project archived flags – ${projectName}`);

    return <ProjectFeaturesArchiveTable projectId={projectId} />;
};
