import {
    isLocalhostDomain,
    isUnleashDomain,
    isVercelBranchDomain,
} from 'utils/env';

export const useFeedbackCESEnabled = (): boolean => {
    return isUnleashDomain() || isVercelBranchDomain() || isLocalhostDomain();
};
