import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Alert } from '@mui/material';
import { IFeatureToggle } from 'interfaces/featureToggle';
import { formatFeaturePath } from '../../FeatureStrategyEdit/FeatureStrategyEdit';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';

interface IFeatureStrategyEnabledProps {
    projectId: string;
    featureId: string;
    environmentId: string;
}

export const FeatureStrategyEnabled: FC<IFeatureStrategyEnabledProps> = ({
    projectId,
    featureId,
    environmentId,
    children,
}) => {
    const featurePagePath = formatFeaturePath(projectId, featureId);
    const { feature } = useFeature(projectId, featureId);

    const featurePageLink = (
        <Link to={featurePagePath}>feature toggle page</Link>
    );

    return (
        <ConditionallyRender
            condition={isFeatureEnabledInEnvironment(feature, environmentId)}
            show={children}
            elseShow={
                <Alert severity="warning">
                    This feature toggle is currently disabled in the{' '}
                    <strong>{environmentId}</strong> environment. Any changes
                    made here will not take effect until the toggle has been
                    enabled on the {featurePageLink}.
                </Alert>
            }
        />
    );
};

const isFeatureEnabledInEnvironment = (
    feature: IFeatureToggle,
    environmentId: string
): boolean => {
    const environment = feature.environments.find(environment => {
        return environment.name === environmentId;
    });

    if (!environment) {
        return false;
    }

    return environment.enabled;
};
