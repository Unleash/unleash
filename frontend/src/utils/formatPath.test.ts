import {
    parseBasePath,
    formatAssetPath,
    formatApiPath,
} from 'utils/formatPath';

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
    expect(formatAssetPath('')).toEqual('');
    expect(formatAssetPath('/')).toEqual('');
    expect(formatAssetPath('a')).toEqual('/a');
    expect(formatAssetPath('/a')).toEqual('/a');
    expect(formatAssetPath('/a/')).toEqual('/a');
    expect(formatAssetPath('a/b/')).toEqual('/a/b');
    expect(formatAssetPath('', '')).toEqual('');
    expect(formatAssetPath('/', '/')).toEqual('');
    expect(formatAssetPath('a', 'x')).toEqual('/x/a');
    expect(formatAssetPath('/a', '/x')).toEqual('/x/a');
    expect(formatAssetPath('/a/', '/x/')).toEqual('/x/a');
    expect(formatAssetPath('a/b/', 'x/y/')).toEqual('/x/y/a/b');
    expect(formatAssetPath('//a//b//', '//x//y//')).toEqual('/x/y/a/b');
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
