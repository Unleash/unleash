import { formatFullDateTime } from '../util';

test('formats dates correctly', () => {
    expect(formatFullDateTime(1487861809466)).toEqual('2017-02-23 14:56:49');
    expect(formatFullDateTime(1487232809466)).toEqual('2017-02-16 08:13:29');
    expect(formatFullDateTime(1477232809466)).toEqual('2016-10-23 14:26:49');
});
