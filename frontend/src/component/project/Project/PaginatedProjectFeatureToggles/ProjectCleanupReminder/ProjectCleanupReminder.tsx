import type { FC } from 'react';
import { Alert, Box, Button, styled } from '@mui/material';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import { useFeatureSearch } from 'hooks/api/getters/useFeatureSearch/useFeatureSearch';
import { useNavigate } from 'react-router-dom';
import { subDays, formatISO } from 'date-fns';
import { useReminders } from 'component/feature/FeatureView/CleanupReminder/useReminders';
import { useHasRootAccess } from 'hooks/useHasAccess';
import { DELETE_FEATURE } from 'component/providers/AccessProvider/permissions';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';

const ActionsBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1),
    alignItems: 'center',
}));

const lastSeenAtDays = 7;
const refreshInterval = 60 * 1_000;
const snoozeReminderDays = 7;

const getQuery = (projectId: string) => {
    const date = subDays(new Date(), lastSeenAtDays);
    const formattedDate = formatISO(date, { representation: 'date' });
    return {
        project: `IS:${projectId}`,
        lifecycle: 'IS:completed',
        lastSeenAt: `IS_BEFORE:${formattedDate}`,
    };
};

export const ProjectCleanupReminder: FC<{
    projectId: string;
}> = ({ projectId }) => {
    const navigate = useNavigate();
    const { shouldShowReminder, snoozeReminder } = useReminders();
    const hasAccess = useHasRootAccess(DELETE_FEATURE, projectId);
    const { trackEvent } = usePlausibleTracker();

    const reminderKey = `project-cleanup-${projectId}`;
    const query = getQuery(projectId);

    const { total, loading } = useFeatureSearch(query, {
        refreshInterval,
    });

    if (!hasAccess || !shouldShowReminder(reminderKey) || loading || !total) {
        return null;
    }

    const handleViewFlags = () => {
        trackEvent('project-cleanup', {
            props: {
                eventType: 'view flags clicked',
            },
        });
        navigate(
            `/projects/${projectId}/features?${new URLSearchParams(query).toString()}`,
        );
    };

    const handleDismiss = () => {
        trackEvent('project-cleanup', {
            props: {
                eventType: 'remind me later',
            },
        });
        snoozeReminder(reminderKey, snoozeReminderDays);
    };

    return (
        <Alert
            severity='warning'
            icon={<CleaningServicesIcon />}
            action={
                <ActionsBox>
                    <Button size='medium' onClick={handleDismiss}>
                        Remind me later
                    </Button>
                    <Button
                        variant='contained'
                        size='medium'
                        onClick={handleViewFlags}
                    >
                        View flags
                    </Button>
                </ActionsBox>
            }
        >
            <b>Time to clean up technical debt?</b>
            <p>
                We haven't observed any metrics for {total} of the flags lately.
                Can {total > 1 ? 'they' : 'it'} be archived?
            </p>
        </Alert>
    );
};
