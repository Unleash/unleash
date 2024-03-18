import { useFeaturesArchive } from 'hooks/api/getters/useFeaturesArchive/useFeaturesArchive';
import type { VFC } from 'react';
import type { SortingRule } from 'react-table';
import { createLocalStorage } from 'utils/createLocalStorage';
import { ArchiveTable } from './ArchiveTable/ArchiveTable';

const defaultSort: SortingRule<string> = { id: 'archivedAt' };

interface IProjectFeaturesTable {
    projectId: string;
}

export const ProjectFeaturesArchiveTable: VFC<IProjectFeaturesTable> = ({
    projectId,
}) => {
    const { archivedFeatures, loading, refetchArchived } =
        useFeaturesArchive(projectId);

    const { value, setValue } = createLocalStorage(
        `${projectId}:ProjectFeaturesArchiveTable`,
        defaultSort,
    );

    return (
        <ArchiveTable
            title='Project archive'
            archivedFeatures={archivedFeatures || []}
            loading={loading}
            storedParams={value}
            setStoredParams={setValue}
            refetch={refetchArchived}
            projectId={projectId}
        />
    );
};
