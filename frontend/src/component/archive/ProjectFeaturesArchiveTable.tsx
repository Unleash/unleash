import { ArchiveTable } from './ArchiveTable/ArchiveTable';
import { SortingRule } from 'react-table';
import { useProjectFeaturesArchive } from 'hooks/api/getters/useProjectFeaturesArchive/useProjectFeaturesArchive';
import { createLocalStorage } from 'utils/createLocalStorage';

const defaultSort: SortingRule<string> = { id: 'archivedAt' };

interface IProjectFeaturesTable {
    projectId: string;
}

export const ProjectFeaturesArchiveTable = ({
    projectId,
}: IProjectFeaturesTable) => {
    const {
        archivedFeatures = [],
        refetchArchived,
        loading,
    } = useProjectFeaturesArchive(projectId);

    const { value, setValue } = createLocalStorage(
        `${projectId}:ProjectFeaturesArchiveTable`,
        defaultSort
    );

    return (
        <ArchiveTable
            title="Project archive"
            archivedFeatures={archivedFeatures}
            loading={loading}
            storedParams={value}
            setStoredParams={setValue}
            refetch={refetchArchived}
            projectId={projectId}
        />
    );
};
