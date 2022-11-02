import { startOfHour, subHours } from 'date-fns';

export interface HourBucket {
    timestamp: Date;
}

export function generateHourBuckets(hours: number): HourBucket[] {
    const start = startOfHour(new Date());

    const result = [];

    for (let i = 0; i < hours; i++) {
        result.push({ timestamp: subHours(start, i) });
    }
    return result;
}
