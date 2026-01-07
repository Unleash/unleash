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
