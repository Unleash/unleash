import React from 'react';
import { Link } from 'react-router-dom';
import ConditionallyRender from 'component/common/ConditionallyRender';
import { Alert } from '@material-ui/lab';
import { IFeatureToggle } from 'interfaces/featureToggle';
import { formatFeaturePath } from '../FeatureStrategyEdit/FeatureStrategyEdit';

interface IFeatureStrategyEnabledProps {
    feature: IFeatureToggle;
    environmentId: string;
}

export const FeatureStrategyEnabled = ({
    feature,
    environmentId,
}: IFeatureStrategyEnabledProps) => {
    const featurePagePath = formatFeaturePath(feature.project, feature.name);

    const featurePageLink = (
        <Link to={featurePagePath} style={{ color: 'inherit' }}>
            feature toggle page
        </Link>
    );

    return (
        <ConditionallyRender
            condition={isFeatureEnabledInEnvironment(feature, environmentId)}
            show={
                <Alert severity="success">
                    This feature toggle is currently enabled in the{' '}
                    <strong>{environmentId}</strong> environment. Any changes
                    made here will be available to users as soon as you hit{' '}
                    <strong>save</strong>.
                </Alert>
            }
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
