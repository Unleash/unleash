import { VFC } from 'react';
import { IFeatureToggleListItem } from 'interfaces/featureToggle';
import { FeatureEnvironmentSeen } from 'component/feature/FeatureView/FeatureEnvironmentSeen/FeatureEnvironmentSeen';

interface IFeatureSeenCellProps {
    feature: IFeatureToggleListItem;
}

export const FeatureEnvironmentSeenCell: VFC<IFeatureSeenCellProps> = ({
    feature,
}) => {
    const environments = Boolean(feature.environments)
        ? Object.values(feature.environments)
        : [];

    return (
        <FeatureEnvironmentSeen
            featureId={feature.name}
            featureLastSeen={feature.lastSeenAt}
            environments={environments}
        />
    );
};
