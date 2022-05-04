import { rewriteHTML } from './rewriteHTML';

const input = `<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8" />
        <link rel="icon" href="::faviconPrefix::/favicon.ico" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="baseUriPath" content="::baseUriPath::" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="unleash" />

        <title>Unleash - Enterprise ready feature toggles</title>
        <link
            href="https://fonts.googleapis.com/icon?family=Material+Icons"
            rel="stylesheet"
        />
        <link
            href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700"
            rel="stylesheet"
        />
    </head>
    <body>
        <div id="app"></div>
    </body>
    <script src="/static/js/2.5ff09a33.chunk.js"></script>
    <script src="/static/js/main.6bcf6c41.chunk.js"></script>
</html>`;

test('rewriteHTML substitutes meta tag with existing rewrite value', () => {
    const result = rewriteHTML(input, '/hosted');
    expect(
        result.includes('<meta name="baseUriPath" content="/hosted" />'),
    ).toBe(true);
});

test('rewriteHTML substitutes meta tag with empty value', () => {
    const result = rewriteHTML(input, '');
    expect(result.includes('<meta name="baseUriPath" content="" />')).toBe(
        true,
    );
});

test('rewriteHTML substitutes asset paths correctly with baseUriPath', () => {
    const result = rewriteHTML(input, '/hosted');
    expect(
        result.includes(
            '<script src="/hosted/static/js/2.5ff09a33.chunk.js"></script>',
        ),
    ).toBe(true);
    expect(
        result.includes(
            ' <script src="/hosted/static/js/main.6bcf6c41.chunk.js"></script>',
        ),
    ).toBe(true);
});

test('rewriteHTML substitutes asset paths correctly without baseUriPath', () => {
    const result = rewriteHTML(input, '');
    expect(
        result.includes(
            '<script src="/static/js/2.5ff09a33.chunk.js"></script>',
        ),
    ).toBe(true);
    expect(
        result.includes(
            ' <script src="/static/js/main.6bcf6c41.chunk.js"></script>',
        ),
    ).toBe(true);
});

test('rewriteHTML swaps out faviconPath if cdnPrefix is set', () => {
    const result = rewriteHTML(input, '', 'https://cdn.getunleash.io/v4.1.0');
    expect(
        result.includes(
            '<link rel="icon" href="https://cdn.getunleash.io/favicon.ico" />',
        ),
    ).toBe(true);
});

test('rewriteHTML sets favicon path to root', () => {
    const result = rewriteHTML(input, '');
    expect(result.includes('<link rel="icon" href="/favicon.ico" />')).toBe(
        true,
    );
});
