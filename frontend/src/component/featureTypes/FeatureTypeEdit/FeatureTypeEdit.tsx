import type { VFC } from 'react';
import { useParams } from 'react-router-dom';
import type { FeatureTypeSchema } from 'openapi';
import { FeatureTypeForm } from './FeatureTypeForm/FeatureTypeForm.tsx';

type FeatureTypeEditProps = {
    featureTypes: FeatureTypeSchema[];
    loading: boolean;
};

export const FeatureTypeEdit: VFC<FeatureTypeEditProps> = ({
    featureTypes,
    loading,
}) => {
    const { featureTypeId } = useParams();
    const featureType = featureTypes.find(
        (featureType) => featureType.id === featureTypeId,
    );

    return <FeatureTypeForm featureType={featureType} loading={loading} />;
};
