import { parseISO, isPast } from 'date-fns';
import { IInstanceStatus, InstanceState } from 'interfaces/instance';
import differenceInDays from 'date-fns/differenceInDays';

const TRIAL_EXPIRES_SOON_DAYS_THRESHOLD = 10;

export const isTrialInstance = (
    instanceStatus: IInstanceStatus | undefined
): boolean => {
    return (
        instanceStatus?.state === InstanceState.TRIAL ||
        instanceStatus?.state === InstanceState.EXPIRED ||
        instanceStatus?.state === InstanceState.CHURNED
    );
};

export const trialHasExpired = (
    instanceStatus: IInstanceStatus | undefined
): boolean => {
    if (
        instanceStatus?.state === InstanceState.EXPIRED ||
        instanceStatus?.state === InstanceState.CHURNED
    ) {
        return true;
    }

    if (
        instanceStatus?.state === InstanceState.TRIAL &&
        instanceStatus?.trialExpiry
    ) {
        return isPast(parseISO(instanceStatus.trialExpiry));
    }

    return false;
};

export const trialExpiresSoon = (
    instanceStatus: IInstanceStatus | undefined
) => {
    if (
        !instanceStatus ||
        instanceStatus.state !== InstanceState.TRIAL ||
        !instanceStatus.trialExpiry
    ) {
        return false;
    }

    return (
        differenceInDays(parseISO(instanceStatus.trialExpiry), new Date()) <=
        TRIAL_EXPIRES_SOON_DAYS_THRESHOLD
    );
};

export const canExtendTrial = (
    instanceStatus: IInstanceStatus | undefined
): boolean => {
    return Boolean(
        instanceStatus &&
            instanceStatus.state === InstanceState.EXPIRED &&
            !instanceStatus.trialExtended
    );
};
