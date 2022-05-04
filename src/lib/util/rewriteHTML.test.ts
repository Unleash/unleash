import { rewriteHTML } from './rewriteHTML';

const input = `<!doctype html><html lang="en"><head><meta charset="utf-8"/><link rel="icon" href="::faviconPrefix::/favicon.ico"/><meta http-equiv="X-UA-Compatible" content="IE=edge"/><meta name="baseUriPath" content="::baseUriPath::"/><meta name="cdnPrefix" content="::cdnPrefix::"/><meta name="viewport" content="width=device-width,initial-scale=1"/><meta name="description" content="unleash"/><title>Unleash</title><link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/><link href="https://fonts.googleapis.com/css2?family=Sen:wght@400;700;800&display=swap" rel="stylesheet"/><script defer="defer" src="/static/js/main.84c7ff99.js"></script><link href="/static/css/main.9558c71e.css" rel="stylesheet"></head><body><div id="app"></div></body></html>`;

test('rewriteHTML substitutes meta tag with existing rewrite value', () => {
    const result = rewriteHTML(input, '/hosted');
    expect(
        result.includes('<meta name="baseUriPath" content="/hosted"/>'),
    ).toBe(true);
});

test('rewriteHTML substitutes meta tag with empty value', () => {
    const result = rewriteHTML(input, '');
    expect(result.includes('<meta name="baseUriPath" content=""/>')).toBe(true);
});

test('rewriteHTML substitutes asset paths correctly with baseUriPath', () => {
    const result = rewriteHTML(input, '/hosted');
    expect(result.includes('<script defer="defer" src="/hosted/')).toBe(true);
});

test('rewriteHTML substitutes asset paths correctly without baseUriPath', () => {
    const result = rewriteHTML(input, '');
    expect(result.includes('<script defer="defer" src="/static/js/')).toBe(
        true,
    );
});

test('rewriteHTML swaps out faviconPath if cdnPrefix is set', () => {
    const result = rewriteHTML(input, '', 'https://cdn.getunleash.io/v4.1.0');
    expect(
        result.includes(
            '<link rel="icon" href="https://cdn.getunleash.io/favicon.ico"/>',
        ),
    ).toBe(true);
});

test('rewriteHTML sets favicon path to root', () => {
    const result = rewriteHTML(input, '');
    expect(result.includes('<link rel="icon" href="/favicon.ico"/>')).toBe(
        true,
    );
});
