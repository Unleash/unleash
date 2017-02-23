import { formatFullDateTime } from '../util';

test('formats dates correctly', () => {
    expect(formatFullDateTime(1487861809466)).toEqual('02/23/2017, 2:56:49 PM');
    expect(formatFullDateTime(1487232809466)).toEqual('02/16/2017, 8:13:29 AM');
    expect(formatFullDateTime(1477232809466)).toEqual('10/23/2016, 2:26:49 PM');
});
