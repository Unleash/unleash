import { type FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import type { ILastSeenEnvironments } from 'interfaces/featureToggle';
import { Box } from '@mui/material';
import { FeatureEnvironmentSeen } from '../../FeatureEnvironmentSeen/FeatureEnvironmentSeen';
import { FeatureLifecycle } from './FeatureLifecycle';
import { FeatureArchiveNotAllowedDialog } from 'component/common/FeatureArchiveDialog/FeatureArchiveNotAllowedDialog';
import { FeatureArchiveDialog } from 'component/common/FeatureArchiveDialog/FeatureArchiveDialog';
import { MarkCompletedDialogue } from './MarkCompletedDialogue';

export const FlagExposure: FC<{
    project: string;
    flagName: string;
    onArchive: () => void;
}> = ({ project, flagName, onArchive }) => {
    const navigate = useNavigate();
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
        <Box sx={{ display: 'flex' }}>
            <FeatureEnvironmentSeen
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
