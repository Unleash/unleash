import { useFeatures } from 'hooks/api/getters/useFeatures/useFeatures';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useFeaturesFilter } from 'hooks/useFeaturesFilter';
import FeatureToggleList from './FeatureToggleList';
import { useFeaturesSort } from 'hooks/useFeaturesSort';

export const FeatureToggleListContainer = () => {
    const { uiConfig } = useUiConfig();
    const { features, loading } = useFeatures();
    const { filtered, filter, setFilter } = useFeaturesFilter(features);
    const { sorted, sort, setSort } = useFeaturesSort(filtered);

    return (
        <FeatureToggleList
            features={sorted}
            loading={loading}
            flags={uiConfig.flags}
            filter={filter}
            setFilter={setFilter}
            sort={sort}
            setSort={setSort}
        />
    );
};
