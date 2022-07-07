import { ProjectFeaturesArchiveTable } from 'component/archive/ProjectFeaturesArchiveTable';
import { usePageTitle } from 'hooks/usePageTitle';

interface IProjectFeaturesArchiveProps {
    projectId: string;
    projectName: string;
}

export const ProjectFeaturesArchive = ({
    projectId,
    projectName,
}: IProjectFeaturesArchiveProps) => {
    usePageTitle(`Project archive – ${projectName}`);

    return <ProjectFeaturesArchiveTable projectId={projectId} />;
};
