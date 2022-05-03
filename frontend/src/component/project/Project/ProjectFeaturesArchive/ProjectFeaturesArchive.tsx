import { ProjectFeaturesArchiveList } from 'component/archive/ProjectFeaturesArchiveList';
import { usePageTitle } from 'hooks/usePageTitle';

interface IProjectFeaturesArchiveProps {
    projectId: string;
}

export const ProjectFeaturesArchive = ({
    projectId,
}: IProjectFeaturesArchiveProps) => {
    usePageTitle('Project Archived Features');

    return <ProjectFeaturesArchiveList projectId={projectId} />;
};
