import React, { type VFC } from 'react';
import { FeatureEnvironmentSeen } from 'component/feature/FeatureView/FeatureEnvironmentSeen/FeatureEnvironmentSeen';
import type { FeatureSearchEnvironmentSchema } from 'openapi';

interface IFeatureSeenCellProps {
    feature: {
        environments?: FeatureSearchEnvironmentSchema[];
        lastSeenAt?: string | null;
    };
}

export const FeatureEnvironmentSeenCell: VFC<IFeatureSeenCellProps> = ({
    feature,
    ...rest
}) => {
    const environments = feature.environments
        ? Object.values(feature.environments)
        : [];

    return (
        <FeatureEnvironmentSeen
            featureLastSeen={feature.lastSeenAt || undefined}
            environments={environments}
            {...rest}
        />
    );
};

export const MemoizedFeatureEnvironmentSeenCell = React.memo(
    FeatureEnvironmentSeenCell,
);
