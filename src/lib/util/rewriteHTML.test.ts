import fs from 'fs';
import path from 'path';
import { rewriteHTML } from './rewriteHTML';
import { findPublicFolder } from './findPublicFolder';

const input = fs
    .readFileSync(path.join(findPublicFolder(), 'index.html'))
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
