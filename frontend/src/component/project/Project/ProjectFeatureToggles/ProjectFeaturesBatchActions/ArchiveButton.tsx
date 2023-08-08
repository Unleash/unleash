import { useMemo, useState, VFC } from 'react';
import { Button } from '@mui/material';
import { PermissionHOC } from 'component/common/PermissionHOC/PermissionHOC';
import { DELETE_FEATURE } from 'component/providers/AccessProvider/permissions';
import useProject from 'hooks/api/getters/useProject/useProject';
import { FeatureArchiveDialog } from 'component/common/FeatureArchiveDialog/FeatureArchiveDialog';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { FeatureSchema } from 'openapi';
import { addDays, isBefore } from 'date-fns';

interface IArchiveButtonProps {
    projectId: string;
    featureIds: string[];
    features: FeatureSchema[];
}

const DEFAULT_USAGE_THRESHOLD_DAYS = 7;

const useFeatureUsage = () => {
    return (feature?: FeatureSchema) => {
        const aWeekAgo = addDays(new Date(), -DEFAULT_USAGE_THRESHOLD_DAYS);
        return !!(
            feature &&
            feature.lastSeenAt &&
            isBefore(new Date(feature.lastSeenAt), aWeekAgo)
        );
    };
};

export const ArchiveButton: VFC<IArchiveButtonProps> = ({
    projectId,
    featureIds,
    features,
}) => {
    const { refetch } = useProject(projectId);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { trackEvent } = usePlausibleTracker();
    const featureIsInUse = useFeatureUsage();

    const featuresWithUsage = useMemo(() => {
        const result = [];
        for (const name of featureIds) {
            const feature = features.find(f => f.name === name);
            if (featureIsInUse(feature)) {
                result.push(name);
            }
        }
        return result;
    }, [JSON.stringify(features), featureIds]);

    const onConfirm = async () => {
        setIsDialogOpen(false);
        await refetch();
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
                        variant="outlined"
                        size="small"
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
                onConfirm={onConfirm}
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
            />
        </>
    );
};
