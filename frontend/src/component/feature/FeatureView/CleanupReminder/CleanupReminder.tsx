import { type FC, useState } from 'react';
import { Alert, Box, styled } from '@mui/material';
import FlagIcon from '@mui/icons-material/OutlinedFlag';
import { parseISO } from 'date-fns';
import differenceInDays from 'date-fns/differenceInDays';

import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import {
    DELETE_FEATURE,
    UPDATE_FEATURE,
} from '../../../providers/AccessProvider/permissions';
import { MarkCompletedDialogue } from '../FeatureOverview/FeatureLifecycle/MarkCompletedDialogue';
import { populateCurrentStage } from '../FeatureOverview/FeatureLifecycle/populateCurrentStage';
import { isSafeToArchive } from '../FeatureOverview/FeatureLifecycle/isSafeToArchive';
import type { IFeatureToggle } from 'interfaces/featureToggle';
import { FeatureArchiveNotAllowedDialog } from 'component/common/FeatureArchiveDialog/FeatureArchiveNotAllowedDialog';
import { FeatureArchiveDialog } from 'component/common/FeatureArchiveDialog/FeatureArchiveDialog';
import { useNavigate } from 'react-router-dom';

const StyledBox = styled(Box)(({ theme }) => ({
    marginRight: theme.spacing(2),
    marginBottom: theme.spacing(2),
}));

type ReminderType = 'complete' | 'removeCode' | 'archive' | null;

export const CleanupReminder: FC<{
    feature: IFeatureToggle;
    onChange: () => void;
}> = ({ feature, onChange }) => {
    const navigate = useNavigate();

    const [markCompleteDialogueOpen, setMarkCompleteDialogueOpen] =
        useState(false);
    const [archiveDialogueOpen, setArchiveDialogueOpen] = useState(false);

    const currentStage = populateCurrentStage(feature);
    const isRelevantType =
        feature.type === 'release' || feature.type === 'experiment';
    const enteredStageAt = currentStage?.enteredStageAt;
    const daysInStage = enteredStageAt
        ? differenceInDays(new Date(), parseISO(enteredStageAt))
        : 0;

    const determineReminder = (): ReminderType => {
        if (!currentStage || !isRelevantType) return null;

        if (currentStage.name === 'live' && daysInStage > 30) {
            return 'complete';
        }
        if (currentStage.name === 'completed') {
            if (isSafeToArchive(currentStage.environments)) {
                return 'archive';
            }
            if (daysInStage > 2) {
                return 'removeCode';
            }
        }

        return null;
    };

    const reminder = determineReminder();

    if (!reminder) return null;

    return (
        <StyledBox>
            {reminder === 'complete' && (
                <>
                    <Alert
                        severity='info'
                        icon={<FlagIcon />}
                        action={
                            <PermissionButton
                                variant='contained'
                                permission={UPDATE_FEATURE}
                                size='small'
                                onClick={() =>
                                    setMarkCompleteDialogueOpen(true)
                                }
                                projectId={feature.project}
                            >
                                Mark completed
                            </PermissionButton>
                        }
                    >
                        <b>Is this flag ready to be completed?</b>
                        <p>
                            This flag has been in production for{' '}
                            <b>{daysInStage} days</b>. Can it be removed from
                            the code?
                        </p>
                    </Alert>
                    <MarkCompletedDialogue
                        isOpen={markCompleteDialogueOpen}
                        setIsOpen={setMarkCompleteDialogueOpen}
                        projectId={feature.project}
                        featureId={feature.name}
                        onComplete={onChange}
                    />
                </>
            )}

            {reminder === 'archive' && (
                <>
                    <Alert
                        severity='warning'
                        action={
                            <PermissionButton
                                variant='contained'
                                permission={DELETE_FEATURE}
                                size='small'
                                sx={{ mb: 2 }}
                                onClick={() => setArchiveDialogueOpen(true)}
                                projectId={feature.project}
                            >
                                Archive flag
                            </PermissionButton>
                        }
                    >
                        <b>Time to clean up technical debt?</b>
                        <p>
                            We haven't observed any metrics for this flag
                            lately. Can it be archived?
                        </p>
                    </Alert>
                    {feature.children.length > 0 ? (
                        <FeatureArchiveNotAllowedDialog
                            features={feature.children}
                            project={feature.project}
                            isOpen={archiveDialogueOpen}
                            onClose={() => setArchiveDialogueOpen(false)}
                        />
                    ) : (
                        <FeatureArchiveDialog
                            isOpen={archiveDialogueOpen}
                            onConfirm={() => {
                                navigate(`/projects/${feature.project}`);
                            }}
                            onClose={() => setArchiveDialogueOpen(false)}
                            projectId={feature.project}
                            featureIds={[feature.name]}
                        />
                    )}
                </>
            )}

            {reminder === 'removeCode' && (
                <Alert severity='warning'>
                    <b>Time to remove flag from code?</b>
                    <p>
                        This flag was marked as complete and ready for cleanup.
                        We're still seeing it being used within the last 2 days.
                        Have you removed the flag from your code?
                    </p>
                </Alert>
            )}
        </StyledBox>
    );
};
