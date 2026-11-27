import { type FC, useContext, useState } from 'react';
import { Button, Paper, styled, Typography } from '@mui/material';
import { addDays } from 'date-fns';
import AccessContext from 'contexts/AccessContext';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import useInstanceStatusApi from 'hooks/api/actions/useInstanceStatusApi/useInstanceStatusApi';
import { useInstanceStatus } from 'hooks/api/getters/useInstanceStatus/useInstanceStatus';
import { useDetailedInvoices } from 'hooks/api/getters/useDetailedInvoices/useDetailedInvoices';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useUiFlag } from 'hooks/useUiFlag';
import { useLocationSettings } from 'hooks/useLocationSettings';
import useToast from 'hooks/useToast';
import { InstanceState } from 'interfaces/instance';
import { formatUnknownError } from 'utils/formatUnknownError';
import { CancelSubscriptionDialog } from './CancelSubscriptionDialog.tsx';

const DELETION_DAYS_AFTER_ACCESS_ENDS = 14;

const StyledCancelledCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadiusLarge,
    border: `1px solid ${theme.palette.warning.containerBorder}`,
    backgroundColor: theme.palette.warning.container,
    color: theme.palette.warning.onContainer,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1.5),
}));

const useSubscriptionCancellation = () => {
    const subscriptionCancellation = useUiFlag('subscriptionCancellation');
    const { hasAccess } = useContext(AccessContext);
    const {
        uiConfig: { billing },
    } = useUiConfig();
    const { instanceStatus, refetchInstanceStatus } = useInstanceStatus();
    const { setToastData, setToastApiError } = useToast();
    const { locationSettings } = useLocationSettings();

    const isAvailable =
        subscriptionCancellation &&
        billing === 'pay-as-you-go' &&
        hasAccess(ADMIN) &&
        instanceStatus?.state === InstanceState.ACTIVE;

    return {
        isAvailable,
        subscriptionAccessEndsAt: instanceStatus?.subscriptionAccessEndsAt,
        refetchInstanceStatus,
        setToastData,
        onError: (error: unknown) =>
            setToastApiError(formatUnknownError(error)),
        formatDate: (date: Date | string) =>
            new Date(date).toLocaleDateString(locationSettings.locale, {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
            }),
    };
};

export const CancelledSubscriptionNotice: FC = () => {
    const {
        isAvailable,
        subscriptionAccessEndsAt,
        refetchInstanceStatus,
        setToastData,
        onError,
        formatDate,
    } = useSubscriptionCancellation();
    const { resumeSubscription, loading } = useInstanceStatusApi();

    if (!isAvailable || !subscriptionAccessEndsAt) {
        return null;
    }

    const onResume = async () => {
        try {
            await resumeSubscription();
            refetchInstanceStatus();
            setToastData({ type: 'success', text: 'Subscription resumed' });
        } catch (error: unknown) {
            onError(error);
        }
    };

    return (
        <StyledCancelledCard elevation={0}>
            <Typography variant='h3'>Subscription cancelled</Typography>
            <Typography variant='body2'>
                Your subscription ends on {formatDate(subscriptionAccessEndsAt)}
                . The instance will be deleted after{' '}
                {formatDate(
                    addDays(
                        new Date(subscriptionAccessEndsAt),
                        DELETION_DAYS_AFTER_ACCESS_ENDS,
                    ),
                )}
                .
            </Typography>
            <Button
                variant='contained'
                color='primary'
                size='large'
                fullWidth
                onClick={onResume}
                disabled={loading}
            >
                Resume subscription
            </Button>
        </StyledCancelledCard>
    );
};

export const CancelSubscription: FC = () => {
    const {
        isAvailable,
        subscriptionAccessEndsAt,
        refetchInstanceStatus,
        setToastData,
        onError,
        formatDate,
    } = useSubscriptionCancellation();
    const { cancelSubscription } = useInstanceStatusApi();
    const { invoices } = useDetailedInvoices();
    const [dialogOpen, setDialogOpen] = useState(false);

    if (!isAvailable || subscriptionAccessEndsAt) {
        return null;
    }

    const periodEnd = invoices.find(
        (invoice) => invoice.status === 'upcoming',
    )?.periodEnd;
    const onConfirm = async (reason: string) => {
        await cancelSubscription(reason);
        setDialogOpen(false);
        refetchInstanceStatus();
        setToastData({ type: 'success', text: 'Subscription cancelled' });
    };

    return (
        <>
            <Button
                variant='outlined'
                color='error'
                fullWidth
                onClick={() => setDialogOpen(true)}
            >
                Cancel subscription
            </Button>
            <CancelSubscriptionDialog
                open={dialogOpen}
                accessEndDate={periodEnd ? formatDate(periodEnd) : undefined}
                deletionDate={
                    periodEnd
                        ? formatDate(
                              addDays(
                                  new Date(periodEnd),
                                  DELETION_DAYS_AFTER_ACCESS_ENDS,
                              ),
                          )
                        : undefined
                }
                onConfirm={onConfirm}
                onError={onError}
                onClose={() => setDialogOpen(false)}
            />
        </>
    );
};
