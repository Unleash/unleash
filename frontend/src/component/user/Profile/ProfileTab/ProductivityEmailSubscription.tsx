import { Box, Switch } from '@mui/material';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useState } from 'react';
import { useEmailSubscriptionApi } from 'hooks/api/actions/useEmailSubscriptionApi/useEmailSubscriptionApi';
import useToast from 'hooks/useToast';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';

export const ProductivityEmailSubscription = () => {
    // TODO: read data from user profile when available
    const [receiveProductivityReportEmail, setReceiveProductivityReportEmail] =
        useState(false);
    const {
        subscribe,
        unsubscribe,
        loading: changingSubscriptionStatus,
    } = useEmailSubscriptionApi();
    const { setToastData, setToastApiError } = useToast();
    const { trackEvent } = usePlausibleTracker();

    return (
        <Box>
            Productivity Email Subscription
            <Switch
                onChange={async () => {
                    try {
                        if (receiveProductivityReportEmail) {
                            await unsubscribe('productivity-report');
                            setToastData({
                                title: 'Unsubscribed from productivity report',
                                type: 'success',
                            });
                            trackEvent('productivity-report', {
                                props: {
                                    eventType: 'subscribe',
                                },
                            });
                        } else {
                            await subscribe('productivity-report');
                            setToastData({
                                title: 'Subscribed to productivity report',
                                type: 'success',
                            });
                            trackEvent('productivity-report', {
                                props: {
                                    eventType: 'unsubscribe',
                                },
                            });
                        }
                    } catch (error) {
                        setToastApiError(formatUnknownError(error));
                    }

                    setReceiveProductivityReportEmail(
                        !receiveProductivityReportEmail,
                    );
                }}
                name='productivity-email'
                checked={receiveProductivityReportEmail}
                disabled={changingSubscriptionStatus}
            />
        </Box>
    );
};
