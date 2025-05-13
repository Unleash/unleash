import { type FC, useState } from 'react';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import type { ILastSeenEnvironments } from 'interfaces/featureToggle';
import { Box } from '@mui/material';
import { FeatureEnvironmentSeen } from '../../FeatureEnvironmentSeen/FeatureEnvironmentSeen.tsx';
import { FeatureLifecycle } from './FeatureLifecycle.tsx';
import { FeatureArchiveNotAllowedDialog } from 'component/common/FeatureArchiveDialog/FeatureArchiveNotAllowedDialog';
import { FeatureArchiveDialog } from 'component/common/FeatureArchiveDialog/FeatureArchiveDialog';
import { MarkCompletedDialogue } from './MarkCompletedDialogue.tsx';

export const FlagExposure: FC<{
    project: string;
    flagName: string;
    onArchive: () => void;
    className?: string;
}> = ({ project, flagName, onArchive, className }) => {
    const { feature, refetchFeature } = useFeature(project, flagName);
    const lastSeenEnvironments: ILastSeenEnvironments[] =
        feature.environments?.map((env) => ({
            name: env.name,
            lastSeenAt: env.lastSeenAt,
            enabled: env.enabled,
            yes: env.yes,
            no: env.no,
        }));
    const [showDelDialog, setShowDelDialog] = useState(false);
    const [showMarkCompletedDialogue, setShowMarkCompletedDialogue] =
        useState(false);

    return (
        <Box sx={{ display: 'flex' }} className={className}>
            <FeatureEnvironmentSeen
                sx={{ pt: 0, pb: 0 }}
                featureLastSeen={feature.lastSeenAt}
                environments={lastSeenEnvironments}
            />
            <FeatureLifecycle
                feature={feature}
                onArchive={() => setShowDelDialog(true)}
                onComplete={() => setShowMarkCompletedDialogue(true)}
                onUncomplete={refetchFeature}
            />

            {feature.children.length > 0 ? (
                <FeatureArchiveNotAllowedDialog
                    features={feature.children}
                    project={project}
                    isOpen={showDelDialog}
                    onClose={() => setShowDelDialog(false)}
                />
            ) : (
                <FeatureArchiveDialog
                    isOpen={showDelDialog}
                    onConfirm={onArchive}
                    onClose={() => setShowDelDialog(false)}
                    projectId={project}
                    featureIds={[flagName]}
                />
            )}

            {feature.project ? (
                <MarkCompletedDialogue
                    isOpen={showMarkCompletedDialogue}
                    setIsOpen={setShowMarkCompletedDialogue}
                    projectId={feature.project}
                    featureId={feature.name}
                    onComplete={refetchFeature}
                />
            ) : null}
        </Box>
    );
};
