import differenceInDays from 'date-fns/differenceInDays';
import type { FeatureTypeSchema } from 'openapi';

export const getDiffInDays = (date: Date, now: Date) => {
    return Math.abs(differenceInDays(date, now));
};

export const expired = (diff: number, type: FeatureTypeSchema) => {
    if (type.lifetimeDays) return diff >= type?.lifetimeDays?.valueOf();

    return false;
};
