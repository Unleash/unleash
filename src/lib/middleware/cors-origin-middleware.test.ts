import { allowRequestOrigin } from './cors-origin-middleware';

test('allowRequestOrigin', () => {
    const dotCom = 'https://example.com';
    const dotOrg = 'https://example.org';

    expect(allowRequestOrigin('', [])).toEqual(false);
    expect(allowRequestOrigin(dotCom, [])).toEqual(false);
    expect(allowRequestOrigin(dotCom, [dotOrg])).toEqual(false);

    expect(allowRequestOrigin(dotCom, [dotCom, dotOrg])).toEqual(true);
    expect(allowRequestOrigin(dotCom, [dotOrg, dotCom])).toEqual(true);
    expect(allowRequestOrigin(dotCom, [dotCom, dotCom])).toEqual(true);

    expect(allowRequestOrigin(dotCom, ['*'])).toEqual(true);
    expect(allowRequestOrigin(dotCom, [dotOrg, '*'])).toEqual(true);
    expect(allowRequestOrigin(dotCom, [dotCom, dotOrg, '*'])).toEqual(true);
});
