import { mustParseSemVer } from './semver';

test('mustParseSemVer valid', () => {
    expect(mustParseSemVer('1.2.3').version).toEqual('1.2.3');
    expect(mustParseSemVer('v1.2.3').version).toEqual('1.2.3');
});

test('mustParseSemVer invalid', () => {
    expect(() => mustParseSemVer('').version).toThrow();
    expect(() => mustParseSemVer('1').version).toThrow();
    expect(() => mustParseSemVer('1.2').version).toThrow();
    expect(() => mustParseSemVer('1.2.3.4').version).toThrow();
});
