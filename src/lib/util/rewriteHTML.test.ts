import fs from 'node:fs';
import path from 'node:path';
import { rewriteHTML } from './rewriteHTML.js';
import { fileURLToPath } from 'node:url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const input = fs
    .readFileSync(path.join(__dirname, '../../test/examples', 'index.html'))
    .toString();

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
            '<script type="module" crossorigin src="/hosted/static/index',
        ),
    ).toBe(true);
});

test('rewriteHTML substitutes asset paths correctly without baseUriPath', () => {
    const result = rewriteHTML(input, '');
    expect(
        result.includes('<script type="module" crossorigin src="/static/index'),
    ).toBe(true);
});

test('rewriteHTML substitutes asset paths correctly with cdnPrefix', () => {
    const result = rewriteHTML(input, '', 'https://cdn.getunleash.io/v4.1.0');
    expect(
        result.includes(
            '<script type="module" crossorigin src="https://cdn.getunleash.io/v4.1.0/static/index',
        ),
    ).toBe(true);
});

test('rewriteHTML swaps out faviconPath if cdnPrefix is set', () => {
    const result = rewriteHTML(input, '', 'https://cdn.getunleash.io/v4.1.0');
    expect(
        result.includes(
            '<link rel="icon" href="https://cdn.getunleash.io/v4.1.0/favicon.ico" />',
        ),
    ).toBe(true);
});

test('rewriteHTML sets favicon path to root', () => {
    const result = rewriteHTML(input, '');
    expect(result.includes('<link rel="icon" href="/favicon.ico" />')).toBe(
        true,
    );
});

test.each([
    '/static',
    '/static/unleash',
    '/static-assets',
])('rewriteHTML preserves baseUriPath %s while prefixing assets once', (baseUriPath) => {
    const result = rewriteHTML(input, baseUriPath);

    expect(result).toContain(
        `<meta name="baseUriPath" content="${baseUriPath}" />`,
    );
    expect(result).toContain(`src="${baseUriPath}/static/index`);
    expect(result).toContain(`href="${baseUriPath}/static/index`);
});

test.each([
    'https://cdn.example.com/static',
    'https://cdn.example.com/static/unleash',
    'https://static.example.com',
])('rewriteHTML preserves CDN prefix %s in configuration and favicon', (cdnPrefix) => {
    const result = rewriteHTML(input, '/hosted', cdnPrefix);

    expect(result).toContain(`<meta name="baseUriPath" content="/hosted" />`);
    expect(result).toContain(
        `<meta name="cdnPrefix" content="${cdnPrefix}" />`,
    );
    expect(result).toContain(`href="${cdnPrefix}/favicon.ico"`);
    expect(result).toContain(`src="${cdnPrefix}/static/index`);
    expect(result).toContain(`href="${cdnPrefix}/static/index`);
});

test('rewriteHTML still rewrites static references in custom HTML', () => {
    const result = rewriteHTML(
        '<a href="/static/manual.pdf">Manual</a><img src="/static/logo.svg" />',
        '/static/unleash',
    );

    expect(result).toBe(
        '<a href="/static/unleash/static/manual.pdf">Manual</a><img src="/static/unleash/static/logo.svg" />',
    );
});
