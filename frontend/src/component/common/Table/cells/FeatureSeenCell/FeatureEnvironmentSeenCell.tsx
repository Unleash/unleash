import React, { type VFC } from 'react';
import { FeatureEnvironmentSeen } from 'component/feature/FeatureView/FeatureEnvironmentSeen/FeatureEnvironmentSeen';
import type { FeatureSearchEnvironmentSchema } from 'openapi';
import { FeatureLifecycle } from 'component/feature/FeatureView/FeatureOverview/FeatureLifecycle/FeatureLifecycle';
import { Box } from '@mui/material';

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

interface IFeatureLifecycleProps {
    feature: {
        environments?: FeatureSearchEnvironmentSchema[];
        lastSeenAt?: string | null;
        project: string;
        name: string;
    };
    onComplete: () => void;
    onUncomplete: () => void;
    onArchive: () => void;
}

export const FeatureLifecycleCell: VFC<IFeatureLifecycleProps> = ({
    feature,
    onComplete,
    onUncomplete,
    onArchive,
    ...rest
}) => {
    const environments = feature.environments
        ? Object.values(feature.environments)
        : [];

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <FeatureLifecycle
                onArchive={onArchive}
                onComplete={onComplete}
                onUncomplete={onUncomplete}
                feature={feature}
            />
        </Box>
    );
};

export const MemoizedFeatureEnvironmentSeenCell = React.memo(
    FeatureEnvironmentSeenCell,
);
