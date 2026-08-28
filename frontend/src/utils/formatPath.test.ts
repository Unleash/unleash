import { expect, test } from 'vitest';
import {
    parseBasePath,
    formatAssetPath,
    formatApiPath,
} from 'utils/formatPath';

// Cast helpers: in tests we pass string literals; in production these are
// always UnformattedAssetPath values coming from Vite's static asset imports.
const asset = (path: string) => path as unknown as UnformattedAssetPath;

test('formatBasePath', () => {
    expect(parseBasePath()).toEqual('');
    expect(parseBasePath('')).toEqual('');
    expect(parseBasePath('/')).toEqual('');
    expect(parseBasePath('a')).toEqual('/a');
    expect(parseBasePath('/a')).toEqual('/a');
    expect(parseBasePath('/a/')).toEqual('/a');
    expect(parseBasePath('a/b/')).toEqual('/a/b');
    expect(parseBasePath('//a//b//')).toEqual('/a/b');
});

test('formatAssetPath', () => {
    expect(formatAssetPath(asset(''))).toEqual('');
    expect(formatAssetPath(asset('/'))).toEqual('');
    expect(formatAssetPath(asset('a'))).toEqual('/a');
    expect(formatAssetPath(asset('/a'))).toEqual('/a');
    expect(formatAssetPath(asset('/a/'))).toEqual('/a');
    expect(formatAssetPath(asset('a/b/'))).toEqual('/a/b');
    expect(formatAssetPath(asset(''), '')).toEqual('');
    expect(formatAssetPath(asset('/'), '/')).toEqual('');
    expect(formatAssetPath(asset('a'), 'x')).toEqual('/x/a');
    expect(formatAssetPath(asset('/a'), '/x')).toEqual('/x/a');
    expect(formatAssetPath(asset('/a/'), '/x/')).toEqual('/x/a');
    expect(formatAssetPath(asset('a/b/'), 'x/y/')).toEqual('/x/y/a/b');
    expect(formatAssetPath(asset('//a//b//'), '//x//y//')).toEqual('/x/y/a/b');
});

test('formatApiPath', () => {
    expect(formatApiPath('')).toEqual('');
    expect(formatApiPath('/')).toEqual('');
    expect(formatApiPath('a')).toEqual('/a');
    expect(formatApiPath('/a')).toEqual('/a');
    expect(formatApiPath('/a/')).toEqual('/a');
    expect(formatApiPath('a/b/')).toEqual('/a/b');
    expect(formatApiPath('', '')).toEqual('');
    expect(formatApiPath('/', '/')).toEqual('');
    expect(formatApiPath('a', 'x')).toEqual('/x/a');
    expect(formatApiPath('/a', '/x')).toEqual('/x/a');
    expect(formatApiPath('/a/', '/x/')).toEqual('/x/a');
    expect(formatApiPath('a/b/', 'x/y/')).toEqual('/x/y/a/b');
    expect(formatApiPath('//a//b//', '//x//y//')).toEqual('/x/y/a/b');
});
