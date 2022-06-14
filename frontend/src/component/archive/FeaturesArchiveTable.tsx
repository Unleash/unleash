import { useFeaturesArchive } from '../../hooks/api/getters/useFeaturesArchive/useFeaturesArchive';
import { ArchiveTable } from './ArchiveTable/ArchiveTable';
import { SortingRule } from 'react-table';
import { usePageTitle } from 'hooks/usePageTitle';
import { createLocalStorage } from 'utils/createLocalStorage';

const defaultSort: SortingRule<string> = { id: 'createdAt', desc: true };
const { value, setValue } = createLocalStorage(
    'FeaturesArchiveTable:v1',
    defaultSort
);

export const FeaturesArchiveTable = () => {
    usePageTitle('Archived');
    const {
        archivedFeatures = [],
        loading,
        refetchArchived,
    } = useFeaturesArchive();

    return (
        <ArchiveTable
            title="Archived"
            archivedFeatures={archivedFeatures}
            loading={loading}
            storedParams={value}
            setStoredParams={setValue}
            refetch={refetchArchived}
        />
    );
};
