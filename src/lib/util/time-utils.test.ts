import { generateDayBuckets, generateHourBuckets } from './time-utils.js';
import { endOfDay, subDays } from 'date-fns';

test('generateHourBuckets', () => {
    const result = generateHourBuckets(24);

    expect(result).toHaveLength(24);
});

test('generateDayBuckets', () => {
    const result = generateDayBuckets(7);
    const endOfDayYesterday = endOfDay(subDays(new Date(), 1));

    expect(result).toHaveLength(7);
    expect(result[0]).toMatchObject({ timestamp: endOfDayYesterday });
});
