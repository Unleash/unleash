import { useFeaturesArchive } from '../../hooks/api/getters/useFeaturesArchive/useFeaturesArchive';
import { ArchiveTable } from './ArchiveTable/ArchiveTable';
import { useSearchParams } from 'react-router-dom';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { SortingRule } from 'react-table';

const defaultSort: SortingRule<string> = { id: 'createdAt', desc: true };

export const FeaturesArchiveTable = () => {
    const {
        archivedFeatures = [],
        loading,
        refetchArchived,
    } = useFeaturesArchive();

    const [searchParams, setSearchParams] = useSearchParams();
    const [storedParams, setStoredParams] = useLocalStorage(
        'FeaturesArchiveTable:v1',
        defaultSort
    );

    return (
        <ArchiveTable
            archivedFeatures={archivedFeatures}
            loading={loading}
            searchParams={searchParams}
            setSearchParams={setSearchParams}
            storedParams={storedParams}
            setStoredParams={setStoredParams}
            refetch={refetchArchived}
            inProject={false}
        />
    );
};
