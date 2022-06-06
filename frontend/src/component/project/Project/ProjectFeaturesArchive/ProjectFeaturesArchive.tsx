import { ProjectFeaturesArchiveTable } from '../../../archive/ProjectFeaturesArchiveTable';

interface IProjectFeaturesArchiveProps {
    projectId: string;
}

export const ProjectFeaturesArchive = ({
    projectId,
}: IProjectFeaturesArchiveProps) => {
    // usePageTitle('Project Archived Features');

    return <ProjectFeaturesArchiveTable projectId={projectId} />;
};
