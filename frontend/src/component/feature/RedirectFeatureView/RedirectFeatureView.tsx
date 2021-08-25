import { useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { getTogglePath } from '../../../utils/route-path-helpers';

interface IRedirectFeatureViewProps {
    featureToggle: any;
    features: any;
    fetchFeatureToggles: () => void;
}

const RedirectFeatureView = ({
    featureToggle,
    fetchFeatureToggles,
}: IRedirectFeatureViewProps) => {
    useEffect(() => {
        if (!featureToggle) {
            fetchFeatureToggles();
        }
        /* eslint-disable-next-line */
    }, []);

    if (!featureToggle) return null;
    return (
        <Redirect
            to={getTogglePath(featureToggle?.project, featureToggle?.name)}
        />
    );
};

export default RedirectFeatureView;
