import { endOfDay, startOfHour, subDays, subHours } from 'date-fns';

export interface HourBucket {
    timestamp: Date;
}

export function generateHourBuckets(hours: number): HourBucket[] {
    const start = startOfHour(new Date());

    const result: HourBucket[] = [];

    for (let i = 0; i < hours; i++) {
        result.push({ timestamp: subHours(start, i) });
    }
    return result;
}

// Generate last x days starting from end of yesterday
export function generateDayBuckets(days: number): HourBucket[] {
    const start = endOfDay(subDays(new Date(), 1));

    const result: HourBucket[] = [];

    for (let i = 0; i < days; i++) {
        result.push({ timestamp: subDays(start, i) });
    }
    return result;
}
