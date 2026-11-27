import { type FC, useState } from 'react';
import { Alert, Box, Button, Typography } from '@mui/material';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import GeneralSelect from 'component/common/GeneralSelect/GeneralSelect';
import Input from 'component/common/Input/Input';
import { useTracking } from 'hooks/useTracking';
import type { Tracking } from 'utils/trackingEvents';

const MAX_DETAILS_LENGTH = 500;

export const CANCELLATION_REASONS = [
    'Too expensive',
    "We're not using it enough",
    'Missing a feature we need',
    'Switching to another tool',
    'Building our own solution',
    'Technical or reliability issues',
    'Other',
];

const cancelSubscriptionTracking: Tracking = {
    event: 'billing',
    type: 'cancel-subscription',
};

type CancelSubscriptionDialogProps = {
    open: boolean;
    accessEndDate?: string;
    deletionDate?: string;
    onConfirm: (reason: string) => Promise<void>;
    onError: (error: unknown) => void;
    onClose: () => void;
};

export const CancelSubscriptionDialog: FC<CancelSubscriptionDialogProps> = ({
    open,
    accessEndDate,
    deletionDate,
    onConfirm,
    onError,
    onClose,
}) => {
    const [reason, setReason] = useState('');
    const [details, setDetails] = useState('');
    const [pending, setPending] = useState(false);
    const track = useTracking(cancelSubscriptionTracking);

    const submit = async () => {
        const trimmedDetails = details.trim();
        setPending(true);
        try {
            await track.mutation(() =>
                onConfirm(
                    trimmedDetails ? `${reason}: ${trimmedDetails}` : reason,
                ),
            );
        } catch (error: unknown) {
            onError(error);
        } finally {
            setPending(false);
        }
    };

    return (
        <Dialogue
            open={open}
            title='Cancel subscription'
            secondaryButtonText='Keep subscription'
            onClose={onClose}
            tracking={cancelSubscriptionTracking}
            fullWidth
            customButton={
                <Button
                    color='error'
                    variant='contained'
                    onClick={submit}
                    disabled={!reason || pending}
                >
                    Cancel subscription
                </Button>
            }
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography>
                    {accessEndDate
                        ? `Your subscription ends on ${accessEndDate}. You keep access until then.`
                        : 'Your subscription ends at the end of the current billing period. You keep access until then.'}
                </Typography>
                <GeneralSelect
                    label='Why are you cancelling?'
                    name='cancellation-reason'
                    value={reason}
                    options={CANCELLATION_REASONS.map((option) => ({
                        key: option,
                        label: option,
                    }))}
                    onChange={setReason}
                    fullWidth
                />
                <Input
                    label="Anything you'd like to add?"
                    multiline
                    minRows={2}
                    fullWidth
                    value={details}
                    onChange={(event) => setDetails(event.target.value)}
                    slotProps={{ htmlInput: { maxLength: MAX_DETAILS_LENGTH } }}
                    helperText={`${details.length}/${MAX_DETAILS_LENGTH}`}
                />
                <Alert severity='info'>
                    We'll email all admins to let them know.{' '}
                    {deletionDate
                        ? `The instance will be deleted after ${deletionDate}.`
                        : 'The instance will be deleted 14 days after the subscription ends.'}
                </Alert>
                <Typography variant='body2'>
                    Have a question?{' '}
                    <a href='mailto:support@getunleash.io?subject=Cancelling my subscription'>
                        Contact us
                    </a>
                </Typography>
            </Box>
        </Dialogue>
    );
};
