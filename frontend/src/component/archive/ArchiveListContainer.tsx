import { useFeaturesArchive } from '../../hooks/api/getters/useFeaturesArchive/useFeaturesArchive';
import FeatureToggleList from '../feature/FeatureToggleList/FeatureToggleList';
import useUiConfig from '../../hooks/api/getters/useUiConfig/useUiConfig';
import { useFeaturesFilter } from '../../hooks/useFeaturesFilter';
import { useFeatureArchiveApi } from '../../hooks/api/actions/useFeatureArchiveApi/useReviveFeatureApi';
import useToast from '../../hooks/useToast';
import { useFeaturesSort } from '../../hooks/useFeaturesSort';

export const ArchiveListContainer = () => {
    const { setToastApiError } = useToast();
    const { uiConfig } = useUiConfig();
    const { reviveFeature } = useFeatureArchiveApi();
    const { archivedFeatures, loading, refetchArchived } = useFeaturesArchive();
    const { filtered, filter, setFilter } = useFeaturesFilter(archivedFeatures);
    const { sorted, sort, setSort } = useFeaturesSort(filtered);

    const revive = (feature: string) => {
        reviveFeature(feature)
            .then(refetchArchived)
            .catch(e => setToastApiError(e.toString()));
    };

    return (
        <FeatureToggleList
            features={sorted}
            loading={loading}
            revive={revive}
            flags={uiConfig.flags}
            filter={filter}
            setFilter={setFilter}
            sort={sort}
            setSort={setSort}
            archive
        />
    );
};
