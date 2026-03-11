import { formatDateYMD, formatDateDM } from 'utils/formatDate';

test('formatDateDM', () => {
    const date = new Date('2026-03-19T23:59:59.999Z');
    expect(formatDateDM(date, 'en-US')).toEqual('March 19');
    expect(formatDateDM(date, 'en-US', 'America/New_York')).toEqual('March 19');
    expect(formatDateDM(date, 'en-US', 'Australia/Sydney')).toEqual('March 20');
});

test('formatDateYMD', () => {
    const date = new Date('2026-03-19T23:59:59.999Z');
    expect(formatDateYMD(date, 'en-US')).toEqual('03/19/2026');
    expect(formatDateYMD(date, 'en-US', 'America/New_York')).toEqual(
        '03/19/2026',
    );
    expect(formatDateYMD(date, 'en-US', 'Australia/Sydney')).toEqual(
        '03/20/2026',
    );
});
