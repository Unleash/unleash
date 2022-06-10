import { useFeaturesArchive } from '../../hooks/api/getters/useFeaturesArchive/useFeaturesArchive';
import { ArchiveTable } from './ArchiveTable/ArchiveTable';
import { useSearchParams } from 'react-router-dom';
import { SortingRule } from 'react-table';
import { usePageTitle } from 'hooks/usePageTitle';
import { createLocalStorage } from 'utils/createLocalStorage';

const defaultSort: SortingRule<string> = { id: 'createdAt', desc: true };

export const FeaturesArchiveTable = () => {
    usePageTitle('Archived');
    const {
        archivedFeatures = [],
        loading,
        refetchArchived,
    } = useFeaturesArchive();

    const [searchParams, setSearchParams] = useSearchParams();
    const { value, setValue } = createLocalStorage(
        'FeaturesArchiveTable:v1',
        defaultSort
    );

    return (
        <ArchiveTable
            title={'Archived'}
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
