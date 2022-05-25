import differenceInDays from 'date-fns/differenceInDays';
import { EXPERIMENT, OPERATIONAL, RELEASE } from 'constants/featureToggleTypes';

const FORTY_DAYS = 40;
const SEVEN_DAYS = 7;

export const toggleExpiryByTypeMap: Record<string, number> = {
    [EXPERIMENT]: FORTY_DAYS,
    [RELEASE]: FORTY_DAYS,
    [OPERATIONAL]: SEVEN_DAYS,
};

export const getDiffInDays = (date: Date, now: Date) => {
    return Math.abs(differenceInDays(date, now));
};

export const expired = (diff: number, type: string) => {
    return diff >= toggleExpiryByTypeMap[type];
};
