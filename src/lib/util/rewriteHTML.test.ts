import { rewriteHTML } from './rewriteHTML';

const input = `
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8" />
        <link rel="icon" href="::faviconPrefix::/favicon.ico" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="baseUriPath" content="::baseUriPath::" />
        <meta name="cdnPrefix" content="::cdnPrefix::" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="unleash" />
        <title>Unleash</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link
            href="https://fonts.googleapis.com/css2?family=Sen:wght@400;700;800&display=swap"
            rel="stylesheet"
        />
      <script type="module" crossorigin src="/assets/index.556ac563.js"></script>
      <link rel="stylesheet" href="/assets/index.4b6b260a.css">
    </head>
    <body>
        <div id="app"></div>

    </body>
</html>
`;

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
            '<script type="module" crossorigin src="/hosted/assets/index',
        ),
    ).toBe(true);
});

test('rewriteHTML substitutes asset paths correctly without baseUriPath', () => {
    const result = rewriteHTML(input, '');
    expect(
        result.includes('<script type="module" crossorigin src="/assets/index'),
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
