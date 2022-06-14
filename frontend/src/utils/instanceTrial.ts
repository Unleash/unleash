import { parseISO, formatDistanceToNowStrict, isPast } from 'date-fns';
import { IInstanceStatus, InstanceState } from 'interfaces/instance';
import differenceInDays from 'date-fns/differenceInDays';

const TRIAL_EXPIRATION_WARNING_DAYS_THRESHOLD = 10;

export const hasTrialExpired = (
    instanceStatus: IInstanceStatus | undefined
): boolean => {
    const trialExpiry = parseTrialExpiryDate(instanceStatus);

    if (!trialExpiry) {
        return false;
    }

    return isPast(trialExpiry);
};

export const formatTrialExpirationWarning = (
    instanceStatus: IInstanceStatus | undefined
): string | undefined => {
    const trialExpiry = parseTrialExpiryDate(instanceStatus);

    if (!trialExpiry || isPast(trialExpiry)) {
        return;
    }

    if (
        differenceInDays(trialExpiry, new Date()) <=
        TRIAL_EXPIRATION_WARNING_DAYS_THRESHOLD
    ) {
        return formatDistanceToNowStrict(trialExpiry, {
            roundingMethod: 'floor',
        });
    }
};

const parseTrialExpiryDate = (
    instanceStatus: IInstanceStatus | undefined
): Date | undefined => {
    if (
        instanceStatus &&
        instanceStatus.state === InstanceState.TRIAL &&
        instanceStatus.trialExpiry
    ) {
        return parseISO(instanceStatus.trialExpiry);
    }
};
