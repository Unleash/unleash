import { useEffect, useState } from 'react';
import { Redirect, useParams } from 'react-router-dom';
import { useFeatures } from 'hooks/api/getters/useFeatures/useFeatures';
import { getTogglePath } from 'utils/routePathHelpers';
import { FeatureSchema } from 'openapi';

interface IRedirectParams {
    name: string;
}

const RedirectFeatureView = () => {
    const { name } = useParams<IRedirectParams>();
    const { features = [] } = useFeatures();
    const [featureToggle, setFeatureToggle] = useState<FeatureSchema>();

    useEffect(() => {
        const toggle = features.find(
            (toggle: FeatureSchema) => toggle.name === name
        );

        setFeatureToggle(toggle);
    }, [features, name]);

    if (!featureToggle) {
        return null;
    }

    return (
        <Redirect
            to={getTogglePath(featureToggle?.project, featureToggle?.name)}
        />
    );
};

export default RedirectFeatureView;
