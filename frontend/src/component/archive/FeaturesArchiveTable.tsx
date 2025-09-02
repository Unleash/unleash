import { ArchiveTable } from 'component/archive/ArchiveTable/ArchiveTable';
import type { SortingRule } from 'react-table';
import { usePageTitle } from 'hooks/usePageTitle';
import { createLocalStorage } from 'utils/createLocalStorage';
import { useFeatureSearch } from 'hooks/api/getters/useFeatureSearch/useFeatureSearch';
import { useSearchParams } from 'react-router-dom';

const defaultSort: SortingRule<string> = { id: 'createdAt' };
const { value, setValue } = createLocalStorage(
    'FeaturesArchiveTable:v1',
    defaultSort,
);

export const FeaturesArchiveTable = () => {
    usePageTitle('Archive');
    const [searchParams] = useSearchParams();

    const {
        features: archivedFeatures,
        loading,
        refetch,
    } = useFeatureSearch({
        query: searchParams.get('search') || undefined,
        archived: 'IS:true',
    });

    return (
        <ArchiveTable
            title='Archive'
            archivedFeatures={archivedFeatures}
            loading={loading}
            storedParams={value}
            setStoredParams={setValue}
            refetch={refetch}
        />
    );
};
