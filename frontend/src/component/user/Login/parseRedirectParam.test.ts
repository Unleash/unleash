import { expect, test } from 'vitest';
import { parseRedirectParam } from 'component/user/Login/parseRedirectParam';

test('parseRedirectParam should parse an empty redirect param', async () => {
    expect(parseRedirectParam('')).toEqual({
        pathname: '/',
        search: '',
    });
});

test('parseRedirectParam should parse the pathname', async () => {
    expect(parseRedirectParam('/foo')).toEqual({
        pathname: '/foo',
        search: '',
    });
});

test('parseRedirectParam should parse the search query', async () => {
    expect(parseRedirectParam('/foo?a=1&b=2')).toEqual({
        pathname: '/foo',
        search: '?a=1&b=2',
    });
});

test('parseRedirectParam should ignore external domains', async () => {
    expect(parseRedirectParam('https://example.com/foo?a=1&b=2')).toEqual({
        pathname: '/foo',
        search: '?a=1&b=2',
    });
});

test('preserves a percent sign in an already-decoded redirect', () => {
    const destination = '/search?query=unfinished%';
    const params = new URLSearchParams({ redirect: destination });
    expect(parseRedirectParam(params.get('redirect')!)).toEqual({
        pathname: '/search',
        search: '?query=unfinished%',
    });
});
