import { describe, expect, it } from 'vitest';
import { buildFlagUsageSnippet } from './buildFlagUsageSnippet.ts';

const API_URL = 'https://example.com/api/';

describe('buildFlagUsageSnippet', () => {
    it('extracts the last code block from a 3-step snippet and substitutes the flag name', () => {
        const raw = [
            '1\\. Install',
            '```sh',
            'npm install foo',
            '```',
            '',
            '2\\. Initialize',
            '```jsx',
            'const client = init();',
            '```',
            '',
            '3\\. Check flag',
            '```jsx',
            "const enabled = useFlag('<YOUR_FLAG>');",
            '```',
        ].join('\n');

        expect(buildFlagUsageSnippet(raw, 'my-flag', API_URL)).toBe(
            "```jsx\nconst enabled = useFlag('my-flag');\n```",
        );
    });

    it('picks the init+check block for 2-step snippets and substitutes both the flag and the API URL', () => {
        const raw = [
            '1\\. Install',
            '```sh',
            'npm install unleash',
            '```',
            '',
            '2\\. Run Unleash',
            '```js',
            "const u = initialize({ url: '<YOUR_API_URL>' });",
            "setInterval(() => console.log(u.isEnabled('<YOUR_FLAG>')), 1000);",
            '```',
        ].join('\n');

        expect(buildFlagUsageSnippet(raw, 'checkout', API_URL)).toBe(
            "```js\nconst u = initialize({ url: 'https://example.com/api/' });\nsetInterval(() => console.log(u.isEnabled('checkout')), 1000);\n```",
        );
    });

    it('ignores content after the first `---` separator (production variant and resource links)', () => {
        const raw = [
            '1\\. Use',
            '```jsx',
            "useFlag('<YOUR_FLAG>')",
            '```',
            '---',
            '```jsx',
            'const config = { token: process.env.TOKEN };',
            '```',
            '---',
            '- [docs](https://example.com)',
        ].join('\n');

        expect(buildFlagUsageSnippet(raw, 'x', API_URL)).toBe(
            "```jsx\nuseFlag('x')\n```",
        );
    });

    it('replaces every occurrence of the placeholders', () => {
        const raw = [
            '```js',
            "const a = isEnabled('<YOUR_FLAG>');",
            "const b = isEnabled('<YOUR_FLAG>');",
            "fetch('<YOUR_API_URL>'); fetch('<YOUR_API_URL>');",
            '```',
        ].join('\n');

        expect(buildFlagUsageSnippet(raw, 'flag-x', API_URL)).toBe(
            "```js\nconst a = isEnabled('flag-x');\nconst b = isEnabled('flag-x');\nfetch('https://example.com/api/'); fetch('https://example.com/api/');\n```",
        );
    });

    it('returns an empty string when there are no code blocks', () => {
        expect(
            buildFlagUsageSnippet('just prose, no fences', 'x', API_URL),
        ).toBe('');
        expect(buildFlagUsageSnippet('', 'x', API_URL)).toBe('');
    });
});
