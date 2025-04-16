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
    onComplete?: () => void;
    onUncomplete?: () => void;
    onArchive?: () => void;
    expanded?: boolean;
}

export const FeatureLifecycleCell: VFC<IFeatureLifecycleProps> = ({
    feature,
    onComplete,
    onUncomplete,
    onArchive,
    expanded,
    ...rest
}) => {
    const environments = feature.environments
        ? Object.values(feature.environments)
        : [];

    return (
        <Box
            sx={(theme) => ({
                display: 'flex',
                justifyContent: 'center',
                padding: theme.spacing(0, expanded ? 1 : 0),
            })}
        >
            <FeatureLifecycle
                onArchive={onArchive}
                onComplete={onComplete}
                onUncomplete={onUncomplete}
                feature={feature}
                expanded={expanded}
            />
        </Box>
    );
};

export const MemoizedFeatureEnvironmentSeenCell = React.memo(
    FeatureEnvironmentSeenCell,
);
