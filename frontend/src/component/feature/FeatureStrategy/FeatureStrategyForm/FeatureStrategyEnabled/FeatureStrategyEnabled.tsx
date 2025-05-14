import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Alert } from '@mui/material';
import type { IFeatureToggle } from 'interfaces/featureToggle';
import { formatFeaturePath } from '../../FeatureStrategyEdit/FeatureStrategyEdit.tsx';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';

interface IFeatureStrategyEnabledProps {
    projectId: string;
    featureId: string;
    environmentId: string;
    isChangeRequest?: boolean;
}

export const FeatureStrategyEnabled: FC<IFeatureStrategyEnabledProps> = ({
    projectId,
    featureId,
    environmentId,
}) => {
    const featurePagePath = formatFeaturePath(projectId, featureId);
    const { feature } = useFeature(projectId, featureId);

    const featurePageLink = <Link to={featurePagePath}>feature flag page</Link>;

    return (
        <ConditionallyRender
            condition={isFeatureEnabledInEnvironment(feature, environmentId)}
            show={
                <Alert severity='success'>
                    This feature flag is currently enabled in the{' '}
                    <strong>{environmentId}</strong> environment. Any changes
                    made here will be available to users as soon as you hit{' '}
                    <strong>save</strong>.
                </Alert>
            }
            elseShow={
                <Alert severity='info'>
                    This feature flag is currently disabled in the{' '}
                    <strong>{environmentId}</strong> environment. Any changes
                    made here will not take effect until the flag has been
                    enabled on the {featurePageLink}.
                </Alert>
            }
        />
    );
};

const isFeatureEnabledInEnvironment = (
    feature: IFeatureToggle,
    environmentId: string,
): boolean => {
    const environment = feature.environments.find((environment) => {
        return environment.name === environmentId;
    });

    if (!environment) {
        return false;
    }

    return environment.enabled;
};
