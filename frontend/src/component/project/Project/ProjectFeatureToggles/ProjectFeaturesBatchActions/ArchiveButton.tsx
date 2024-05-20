import { useMemo, useState, type VFC } from 'react';
import { Button } from '@mui/material';
import { PermissionHOC } from 'component/common/PermissionHOC/PermissionHOC';
import { DELETE_FEATURE } from 'component/providers/AccessProvider/permissions';
import { FeatureArchiveDialog } from 'component/common/FeatureArchiveDialog/FeatureArchiveDialog';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import type { FeatureSchema } from 'openapi';
import { addDays, isBefore } from 'date-fns';

interface IArchiveButtonProps {
    projectId: string;
    featureIds: string[];
    features: FeatureSchema[];
    onConfirm?: () => void;
}

const DEFAULT_USAGE_THRESHOLD_DAYS = 7;

const isFeatureInUse = (feature?: FeatureSchema): boolean => {
    const aWeekAgo = addDays(new Date(), -DEFAULT_USAGE_THRESHOLD_DAYS);
    return !!(
        feature?.lastSeenAt && isBefore(new Date(feature.lastSeenAt), aWeekAgo)
    );
};

export const ArchiveButton: VFC<IArchiveButtonProps> = ({
    projectId,
    featureIds,
    features,
    onConfirm,
}) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { trackEvent } = usePlausibleTracker();

    const featuresWithUsage = useMemo(() => {
        return featureIds.filter((name) => {
            const feature = features.find((f) => f.name === name);
            return isFeatureInUse(feature);
        });
    }, [JSON.stringify(features), featureIds]);

    const onArchive = async () => {
        setIsDialogOpen(false);
        onConfirm?.();
        trackEvent('batch_operations', {
            props: {
                eventType: 'features archived',
            },
        });
    };

    return (
        <>
            <PermissionHOC projectId={projectId} permission={DELETE_FEATURE}>
                {({ hasAccess }) => (
                    <Button
                        disabled={!hasAccess || isDialogOpen}
                        variant='outlined'
                        size='small'
                        onClick={() => setIsDialogOpen(true)}
                    >
                        Archive
                    </Button>
                )}
            </PermissionHOC>
            <FeatureArchiveDialog
                projectId={projectId}
                featureIds={featureIds}
                featuresWithUsage={featuresWithUsage}
                onConfirm={onArchive}
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
            />
        </>
    );
};
