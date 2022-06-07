import { ArchiveTable } from './ArchiveTable/ArchiveTable';
import { useSearchParams } from 'react-router-dom';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { SortingRule } from 'react-table';
import { useProjectFeaturesArchive } from '../../hooks/api/getters/useProjectFeaturesArchive/useProjectFeaturesArchive';

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
    const [storedParams, setStoredParams] = useLocalStorage(
        'ProjectFeaturesArchiveTable:v1',
        defaultSort
    );

    return (
        <ArchiveTable
            title={'Project Features Archive'}
            archivedFeatures={archivedFeatures}
            loading={loading}
            searchParams={searchParams}
            setSearchParams={setSearchParams}
            storedParams={storedParams}
            setStoredParams={setStoredParams}
            refetch={refetchArchived}
        />
    );
};
