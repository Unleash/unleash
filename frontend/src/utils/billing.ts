import { differenceInDays, parseISO } from 'date-fns';
import { IInstanceStatus } from 'interfaces/instance';

export const calculateTrialDaysRemaining = (
    instanceStatus?: IInstanceStatus
): number | undefined => {
    return instanceStatus?.trialExpiry
        ? differenceInDays(parseISO(instanceStatus.trialExpiry), new Date())
        : undefined;
};
