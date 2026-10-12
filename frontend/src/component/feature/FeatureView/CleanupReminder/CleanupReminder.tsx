import { type FC, useState } from 'react';
import { Alert, type AlertProps, Box, Button, styled } from '@mui/material';
import FlagIcon from '@mui/icons-material/OutlinedFlag';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import {
    addYears,
    differenceInCalendarDays,
    differenceInDays,
    isAfter,
    parseISO,
} from 'date-fns';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { formatDateYMD } from 'utils/formatDate';

import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import {
    DELETE_FEATURE,
    UPDATE_FEATURE,
} from '../../../providers/AccessProvider/permissions.ts';
import { MarkCompletedDialogue } from '../FeatureOverview/FeatureLifecycle/MarkCompletedDialogue.tsx';
import { populateCurrentStage } from '../FeatureOverview/FeatureLifecycle/populateCurrentStage.ts';
import { isSafeToArchive } from '../FeatureOverview/FeatureLifecycle/isSafeToArchive.ts';
import type { IFeatureToggle } from 'interfaces/featureToggle';
import { FeatureArchiveNotAllowedDialog } from 'component/common/FeatureArchiveDialog/FeatureArchiveNotAllowedDialog';
import { FeatureArchiveDialog } from 'component/common/FeatureArchiveDialog/FeatureArchiveDialog';
import { useNavigate } from 'react-router';
import { useReminders } from './useReminders.ts';
import { useTracking } from 'hooks/useTracking';
import { snoozeReminderTracking } from '../FeatureOverview/FeatureLifecycle/lifecycleTracking';
import { useUncomplete } from '../FeatureOverview/FeatureLifecycle/useUncomplete.ts';
import { archiveFlagTracking } from 'component/feature/flagActionsTracking';

const StyledBox = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(2),
}));

const ActionsBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1),
    alignItems: 'center',
}));

const StyledTime = styled('time')({
    fontWeight: 'bold',
});

const ReminderAlert = (props: AlertProps) => (
    <Alert
        slotProps={{
            root: {
                sx: { flexWrap: 'wrap' },
            },
            message: {
                sx: { flex: (theme) => `1 1 ${theme.spacing(40)}` },
            },
            action: {
                sx: {
                    marginLeft: 'auto',
                    paddingTop: 0,
                    alignSelf: 'center',
                    whiteSpace: 'nowrap',
                },
            },
        }}
        {...props}
    />
);

type ReminderType =
    | 'complete'
    | 'remove-code'
    | 'archive'
    | 'lifetime'
    | 'permanent'
    | null;

export const COMPLETE_REMINDER_DAYS = 30;
export const REMOVE_CODE_REMINDER_DAYS = 3;
const aYearFromNow = () => {
    const now = new Date();
    return differenceInCalendarDays(addYears(now, 1), now);
};

const remindersForUncompletedFlag: ReminderType[] = [
    'complete',
    'lifetime',
    'permanent',
];

export const CleanupReminder: FC<{
    feature: IFeatureToggle;
    onChange: () => void;
}> = ({ feature, onChange }) => {
    const navigate = useNavigate();
    const [markCompleteDialogueOpen, setMarkCompleteDialogueOpen] =
        useState(false);
    const [archiveDialogueOpen, setArchiveDialogueOpen] = useState(false);

    const currentStage = populateCurrentStage(feature);
    const { onUncompleteHandler, loading } = useUncomplete({
        feature: feature.name,
        project: feature.project,
        stage: currentStage,
        onChange,
    });
    const isRelevantType =
        feature.type === 'release' || feature.type === 'experiment';
    const enteredStageAt = currentStage?.enteredStageAt;
    const daysInStage = enteredStageAt
        ? differenceInDays(new Date(), parseISO(enteredStageAt))
        : 0;
    const { shouldShowReminder, snoozeReminder } = useReminders();
    const { locationSettings } = useLocationSettings();

    const lifecycleReminder = (): ReminderType => {
        if (!currentStage || !isRelevantType) return null;

        if (
            currentStage.name === 'live' &&
            daysInStage > COMPLETE_REMINDER_DAYS
        ) {
            return 'complete';
        }
        if (
            currentStage.name === 'completed' &&
            shouldShowReminder(feature.name)
        ) {
            if (isSafeToArchive(currentStage.environments)) {
                return 'archive';
            }
            if (daysInStage > REMOVE_CODE_REMINDER_DAYS) {
                return 'remove-code';
            }
        }

        return null;
    };

    const permanentReminderKey = `${feature.name}:permanent`;

    const lifetimeReminder = (): ReminderType => {
        const { expectedLifetimeEndsAt } = feature;
        if (
            expectedLifetimeEndsAt === undefined ||
            currentStage?.name === 'completed' ||
            currentStage?.name === 'archived'
        ) {
            return null;
        }
        if (expectedLifetimeEndsAt === null) {
            const yearSinceCreation = addYears(parseISO(feature.createdAt), 1);
            const yearHasPassed = isAfter(new Date(), yearSinceCreation);
            return yearHasPassed && shouldShowReminder(permanentReminderKey)
                ? 'permanent'
                : null;
        }
        const lifetimeHasEnded = isAfter(
            new Date(),
            parseISO(expectedLifetimeEndsAt),
        );
        return lifetimeHasEnded ? 'lifetime' : null;
    };

    const reminder = lifecycleReminder() ?? lifetimeReminder();

    const isUncompletedFlagReminder =
        remindersForUncompletedFlag.includes(reminder);
    const plannedCleanupDate = feature.expectedLifetimeEndsAt ? (
        <StyledTime dateTime={feature.expectedLifetimeEndsAt}>
            {formatDateYMD(
                feature.expectedLifetimeEndsAt,
                locationSettings.locale,
            )}
        </StyledTime>
    ) : undefined;
    const trackSnoozeReminder = useTracking(snoozeReminderTracking);

    if (!reminder) return null;

    const onSnooze = () => {
        snoozeReminder(feature.name);
        trackSnoozeReminder('succeeded', { reminder });
    };

    const onSkipForNow = () => {
        snoozeReminder(permanentReminderKey, aYearFromNow());
        trackSnoozeReminder('succeeded', { reminder });
    };

    return (
        <StyledBox>
            {reminder === 'lifetime' && (
                <ReminderAlert
                    severity='info'
                    icon={<FlagIcon />}
                    action={
                        <MarkCompletedButton
                            projectId={feature.project}
                            onClick={() => setMarkCompleteDialogueOpen(true)}
                        />
                    }
                >
                    <strong>This flag has reached its expected lifetime</strong>
                    <p>
                        When you created this flag, you planned to clean it up
                        by {plannedCleanupDate}. Is it ready to be removed from
                        the code?
                    </p>
                </ReminderAlert>
            )}

            {reminder === 'permanent' && (
                <ReminderAlert
                    severity='info'
                    icon={<FlagIcon />}
                    action={
                        <ActionsBox>
                            <Button size='medium' onClick={onSkipForNow}>
                                Skip for now
                            </Button>
                            <MarkCompletedButton
                                projectId={feature.project}
                                onClick={() =>
                                    setMarkCompleteDialogueOpen(true)
                                }
                            />
                        </ActionsBox>
                    }
                >
                    <strong>Yearly check-in: is this flag still needed?</strong>
                    <p>
                        You set this flag as <strong>permanent</strong> when you
                        created it, so we check in once a year. If it's no
                        longer in use, mark it as completed so it can be removed
                        from the code.
                    </p>
                </ReminderAlert>
            )}

            {reminder === 'complete' && (
                <>
                    <ReminderAlert
                        severity='info'
                        icon={<FlagIcon />}
                        action={
                            <MarkCompletedButton
                                projectId={feature.project}
                                onClick={() =>
                                    setMarkCompleteDialogueOpen(true)
                                }
                            />
                        }
                    >
                        <strong>Is this flag ready to be completed?</strong>
                        <p>
                            This flag has been in production for{' '}
                            <strong>{daysInStage} days</strong>. Can it be
                            removed from the code?
                        </p>
                    </ReminderAlert>
                </>
            )}

            {isUncompletedFlagReminder && (
                <MarkCompletedDialogue
                    isOpen={markCompleteDialogueOpen}
                    setIsOpen={setMarkCompleteDialogueOpen}
                    projectId={feature.project}
                    featureId={feature.name}
                    onComplete={onChange}
                    openedFrom='reminder-banner'
                />
            )}

            {reminder === 'archive' && (
                <>
                    <ReminderAlert
                        severity='warning'
                        icon={<CleaningServicesIcon />}
                        action={
                            <ActionsBox>
                                <Button size='medium' onClick={onSnooze}>
                                    Remind me later
                                </Button>
                                <PermissionButton
                                    variant='contained'
                                    permission={DELETE_FEATURE}
                                    size='medium'
                                    onClick={() => setArchiveDialogueOpen(true)}
                                    projectId={feature.project}
                                >
                                    Archive flag
                                </PermissionButton>
                            </ActionsBox>
                        }
                    >
                        <strong>Time to clean up technical debt?</strong>
                        <p>
                            We haven't observed any metrics for this flag
                            lately. Can it be archived?
                        </p>
                    </ReminderAlert>
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
                            tracking={archiveFlagTracking}
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

            {reminder === 'remove-code' && (
                <ReminderAlert
                    severity='warning'
                    icon={<CleaningServicesIcon />}
                    action={
                        <ActionsBox>
                            <Button size='medium' onClick={onSnooze}>
                                Remind me later
                            </Button>
                            <PermissionButton
                                variant='outlined'
                                permission={UPDATE_FEATURE}
                                size='medium'
                                onClick={onUncompleteHandler}
                                disabled={loading}
                                projectId={feature.project}
                            >
                                Revert to previous stage
                            </PermissionButton>
                        </ActionsBox>
                    }
                >
                    <strong>Time to remove flag from code?</strong>
                    <p>
                        This flag was marked as complete and ready for cleanup.
                        We're still seeing it being used within the last 2 days.
                        Have you removed the flag from your code?
                    </p>
                </ReminderAlert>
            )}
        </StyledBox>
    );
};

const MarkCompletedButton = ({
    projectId,
    onClick,
}: {
    projectId: string;
    onClick: () => void;
}) => (
    <PermissionButton
        variant='contained'
        permission={UPDATE_FEATURE}
        size='medium'
        onClick={onClick}
        projectId={projectId}
    >
        Mark completed
    </PermissionButton>
);
