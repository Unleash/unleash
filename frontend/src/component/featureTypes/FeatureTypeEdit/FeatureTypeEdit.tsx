import type { FC } from 'react';
import { useParams } from 'react-router';
import type { FeatureTypeSchema } from 'openapi';
import { FeatureTypeForm } from './FeatureTypeForm/FeatureTypeForm.tsx';

type FeatureTypeEditProps = {
    featureTypes: FeatureTypeSchema[];
    loading: boolean;
};

export const FeatureTypeEdit: FC<FeatureTypeEditProps> = ({
    featureTypes,
    loading,
}) => {
    const { featureTypeId } = useParams();
    const featureType = featureTypes.find(
        (featureType) => featureType.id === featureTypeId,
    );

    return <FeatureTypeForm featureType={featureType} loading={loading} />;
};
