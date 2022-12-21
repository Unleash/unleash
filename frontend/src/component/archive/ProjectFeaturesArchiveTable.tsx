import { VFC } from 'react';
import { SortingRule } from 'react-table';
import { createLocalStorage } from 'utils/createLocalStorage';
import { useGetArchivedFeaturesByProjectId } from 'openapi';
import { ArchiveTable } from './ArchiveTable/ArchiveTable';

const defaultSort: SortingRule<string> = { id: 'archivedAt' };

interface IProjectFeaturesTable {
    projectId: string;
}

export const ProjectFeaturesArchiveTable: VFC<IProjectFeaturesTable> = ({
    projectId,
}) => {
    const { data, isLoading, mutate } =
        useGetArchivedFeaturesByProjectId(projectId);

    const { value, setValue } = createLocalStorage(
        `${projectId}:ProjectFeaturesArchiveTable`,
        defaultSort
    );

    return (
        <ArchiveTable
            title="Project archive"
            archivedFeatures={data?.features || []}
            loading={isLoading}
            storedParams={value}
            setStoredParams={setValue}
            refetch={mutate}
            projectId={projectId}
        />
    );
};
