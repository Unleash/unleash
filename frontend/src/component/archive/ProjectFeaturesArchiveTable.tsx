import { ArchiveTable } from './ArchiveTable/ArchiveTable';
import { useSearchParams } from 'react-router-dom';
import { SortingRule } from 'react-table';
import { useProjectFeaturesArchive } from '../../hooks/api/getters/useProjectFeaturesArchive/useProjectFeaturesArchive';
import { createLocalStorage } from 'utils/createLocalStorage';

const defaultSort: SortingRule<string> = { id: 'archivedAt', desc: true };

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

    const [searchParams, setSearchParams] = useSearchParams();
    const { value, setValue } = createLocalStorage(
        `${projectId}:ProjectFeaturesArchiveTable`,
        defaultSort
    );

    return (
        <ArchiveTable
            title='Project Features Archive'
            archivedFeatures={archivedFeatures}
            loading={loading}
            searchParams={searchParams}
            setSearchParams={setSearchParams}
            storedParams={value}
            setStoredParams={setValue}
            refetch={refetchArchived}
        />
    );
};
