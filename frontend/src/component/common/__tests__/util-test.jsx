import { formatFullDateTimeWithLocale } from '../util';

test('formats dates correctly', () => {
    expect(formatFullDateTimeWithLocale(1487861809466, 'nb-NO', 'UTC')).toEqual('2017-02-23 14:56:49');
    expect(formatFullDateTimeWithLocale(1487861809466, 'nb-NO', 'Europe/Paris')).toEqual('2017-02-23 15:56:49');
    expect(formatFullDateTimeWithLocale(1487861809466, 'nb-NO', 'Europe/Oslo')).toEqual('2017-02-23 15:56:49');
    expect(formatFullDateTimeWithLocale(1487861809466, 'nb-NO', 'Europe/London')).toEqual('2017-02-23 14:56:49');
    expect(formatFullDateTimeWithLocale(1487861809466, 'en-GB', 'Europe/Paris')).toEqual('02/23/2017, 3:56:49 PM');
    expect(formatFullDateTimeWithLocale(1487861809466, 'en-GB', 'Europe/Oslo')).toEqual('02/23/2017, 3:56:49 PM');
    expect(formatFullDateTimeWithLocale(1487861809466, 'en-GB', 'Europe/London')).toEqual('02/23/2017, 2:56:49 PM');

    expect(formatFullDateTimeWithLocale(1487861809466, 'nb-NO')).toEqual(
        expect.stringMatching(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/)
    );
    expect(formatFullDateTimeWithLocale(1487861809466, 'en-GB')).toEqual(expect.stringContaining('02/23/2017'));
    expect(formatFullDateTimeWithLocale(1487861809466, 'en-US')).toEqual(expect.stringContaining('02/23/2017'));
});
