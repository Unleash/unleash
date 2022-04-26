import { FeatureSchema } from 'openapi';
import { openApiAdmin } from 'utils/openapiClient';
import { useApiGetter } from 'hooks/api/getters/useApiGetter/useApiGetter';

export interface IUseFeaturesOutput {
    features?: FeatureSchema[];
    refetchFeatures: () => void;
    loading: boolean;
    error?: Error;
}

export const useFeatures = (): IUseFeaturesOutput => {
    const { data, refetch, loading, error } = useApiGetter(
        'apiAdminFeaturesGet',
        () => openApiAdmin.apiAdminFeaturesGet()
    );

    return {
        features: data?.features,
        refetchFeatures: refetch,
        loading,
        error,
    };
};
