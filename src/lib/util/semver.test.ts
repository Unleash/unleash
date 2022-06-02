import { mustParseStrictSemVer, parseStrictSemVer } from './semver';

test('parseStrictSemVer', () => {
    expect(parseStrictSemVer('')).toEqual(null);
    expect(parseStrictSemVer('v')).toEqual(null);
    expect(parseStrictSemVer('v1')).toEqual(null);
    expect(parseStrictSemVer('v1.2.3')).toEqual(null);
    expect(parseStrictSemVer('=1.2.3')).toEqual(null);
    expect(parseStrictSemVer('1.2')).toEqual(null);
    expect(parseStrictSemVer('1.2.3.4')).toEqual(null);
    expect(parseStrictSemVer('1.2.3')!.version).toEqual('1.2.3');
});

test('mustParseSemVer', () => {
    expect(() => mustParseStrictSemVer('').version).toThrow();
    expect(() => mustParseStrictSemVer('1').version).toThrow();
    expect(() => mustParseStrictSemVer('1.2').version).toThrow();
    expect(() => mustParseStrictSemVer('v1.2').version).toThrow();
    expect(() => mustParseStrictSemVer('v1.2.3').version).toThrow();
    expect(() => mustParseStrictSemVer('=1.2.3').version).toThrow();
    expect(() => mustParseStrictSemVer('1.2.3.4').version).toThrow();
    expect(mustParseStrictSemVer('1.2.3').version).toEqual('1.2.3');
});
