import { parseRedirectParam } from 'component/user/Login/parseRedirectParam';

test('parseRedirectParam should parse an empty redirect param', async () => {
    expect(parseRedirectParam('')).toEqual({
        pathname: '/',
        search: '',
    });
});

test('parseRedirectParam should parse the pathname', async () => {
    expect(parseRedirectParam(encodeURIComponent('/foo'))).toEqual({
        pathname: '/foo',
        search: '',
    });
});

test('parseRedirectParam should parse the search query', async () => {
    expect(parseRedirectParam(encodeURIComponent('/foo?a=1&b=2'))).toEqual({
        pathname: '/foo',
        search: '?a=1&b=2',
    });
});

test('parseRedirectParam should ignore external domains', async () => {
    expect(
        parseRedirectParam(
            encodeURIComponent('https://example.com/foo?a=1&b=2')
        )
    ).toEqual({
        pathname: '/foo',
        search: '?a=1&b=2',
    });
});
