import { formatDateYMD } from 'utils/formatDate';

test('formatDateYMD', () => {
    const date = new Date('2026-03-19T23:59:59.999Z');
    expect(formatDateYMD(date, 'en-US')).toEqual('03/19/2026');
    expect(formatDateYMD(date, 'en-US', 'America/New_York')).toEqual(
        '03/19/2026',
    );
    expect(formatDateYMD(date, 'en-US', 'Australia/Sydney')).toEqual(
        '03/20/2026',
    );
    expect(formatDateYMD(date, 'pl-PL', 'UTC')).toEqual('19.03.2026');
});
