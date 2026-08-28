import { useMemo, useState, type FC } from 'react';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import { DELETE_FEATURE } from 'component/providers/AccessProvider/permissions';
import { FeatureArchiveDialog } from 'component/common/FeatureArchiveDialog/FeatureArchiveDialog';
import { useEventTracker } from 'hooks/useEventTracker';
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

export const ArchiveButton: FC<IArchiveButtonProps> = ({
    projectId,
    featureIds,
    features,
    onConfirm,
}) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { trackEvent } = useEventTracker();

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
            <PermissionButton
                permission={DELETE_FEATURE}
                projectId={projectId}
                disabled={isDialogOpen}
                variant='outlined'
                size='medium'
                onClick={() => setIsDialogOpen(true)}
            >
                Archive
            </PermissionButton>
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
