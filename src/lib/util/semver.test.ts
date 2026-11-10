import { mustParseStrictSemVer, parseStrictSemVer } from './semver.js';

test('parseStrictSemVer', () => {
    expect(parseStrictSemVer('')).toEqual(null);
    expect(parseStrictSemVer('v')).toEqual(null);
    expect(parseStrictSemVer('v1')).toEqual(null);
    expect(parseStrictSemVer('v1.2.3')).toEqual(null);
    expect(parseStrictSemVer('=1.2.3')).toEqual(null);
    expect(parseStrictSemVer('1.2')).toEqual(null);
    expect(parseStrictSemVer('1.2.3.4')).toEqual(null);
    expect(parseStrictSemVer(' 1.2.3 ')).toEqual(null);
    expect(parseStrictSemVer('1.2.3+')).toEqual(null);
    expect(parseStrictSemVer('1.2.3')!.version).toEqual('1.2.3');
});

test('parseStrictSemVer accepts prerelease and build metadata', () => {
    expect(parseStrictSemVer('1.2.3-beta.1')!.version).toEqual('1.2.3-beta.1');

    const withBuild = parseStrictSemVer('1.2.3+4000')!;
    expect(withBuild.version).toEqual('1.2.3');
    expect(withBuild.build).toEqual(['4000']);

    const withBoth = parseStrictSemVer('1.2.3-beta.1+build.5')!;
    expect(withBoth.version).toEqual('1.2.3-beta.1');
    expect(withBoth.build).toEqual(['build', '5']);
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
    expect(mustParseStrictSemVer('1.2.3+4000').build).toEqual(['4000']);
});
