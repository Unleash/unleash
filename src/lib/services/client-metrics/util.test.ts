import { IClientMetricsEnv } from '../../types/stores/client-metrics-store-v2';
import { generateLastNHours, groupMetricsOnEnv, roundDownToHour } from './util';

test('should return list of 24 horus', () => {
    const hours = generateLastNHours(24, new Date(2021, 10, 10, 15, 30, 1, 0));

    expect(hours).toHaveLength(24);
    expect(hours[0]).toStrictEqual(new Date(2021, 10, 10, 15, 0, 0));
    expect(hours[1]).toStrictEqual(new Date(2021, 10, 10, 14, 0, 0));
    expect(hours[2]).toStrictEqual(new Date(2021, 10, 10, 13, 0, 0));
    expect(hours[23]).toStrictEqual(new Date(2021, 10, 9, 16, 0, 0));
});
