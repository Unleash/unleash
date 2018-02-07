import { formatFullDateTimeWithLocale } from '../util';

test('formats dates correctly', () => {
    expect(formatFullDateTimeWithLocale(1487861809466, 'nb-NO')).toEqual('2017-02-23 14:56:49');
    expect(formatFullDateTimeWithLocale(1487232809466, 'nb-NO')).toEqual('2017-02-16 08:13:29');
    expect(formatFullDateTimeWithLocale(1477232809466, 'nb-NO')).toEqual('2016-10-23 14:26:49');

    expect(formatFullDateTimeWithLocale(1487861809466, 'us-US')).toEqual('2017-02-23 09:56:49');
    expect(formatFullDateTimeWithLocale(1487232809466, 'us-US')).toEqual('2017-02-16 03:13:29');
    expect(formatFullDateTimeWithLocale(1477232809466, 'us-US')).toEqual('2016-10-23 10:26:49');
});
