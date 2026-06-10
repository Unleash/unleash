import { ArchiveTable } from 'component/archive/ArchiveTable/ArchiveTable';
import { usePageTitle } from 'hooks/usePageTitle';
import { createLocalStorage } from 'utils/createLocalStorage';
import { useFeatureSearch } from 'hooks/api/getters/useFeatureSearch/useFeatureSearch';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useUiFlag } from 'hooks/useUiFlag';

const defaultSort: { id: string; desc?: boolean } = { id: 'createdAt' };
const { value, setValue } = createLocalStorage(
    'FeaturesArchiveTable:v1',
    defaultSort,
);

export const FeaturesArchiveTable = () => {
    const archiveInFlagsView = useUiFlag('archiveInFlagsView');
    usePageTitle('Archive');
    const [searchParams] = useSearchParams();
    const search = searchParams.get('search');

    const {
        features: archivedFeatures,
        loading,
        refetch,
    } = useFeatureSearch({
        query: search || undefined,
        archived: 'IS:true',
    });

    if (archiveInFlagsView) {
        const params = new URLSearchParams(searchParams);
        if (search) {
            params.set('query', search);
            params.delete('search');
        }
        params.set('lifecycle', 'IS:archived');
        return <Navigate to={`/search?${params.toString()}`} replace />;
    }

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
