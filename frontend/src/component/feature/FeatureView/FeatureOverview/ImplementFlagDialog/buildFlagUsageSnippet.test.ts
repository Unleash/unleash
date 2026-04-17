import { describe, expect, it } from 'vitest';
import { buildFlagUsageSnippet } from './buildFlagUsageSnippet.ts';

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

        expect(buildFlagUsageSnippet(raw, 'my-flag')).toBe(
            "```jsx\nconst enabled = useFlag('my-flag');\n```",
        );
    });

    it('picks the init+check block for 2-step snippets where the flag check lives inside the init block', () => {
        const raw = [
            '1\\. Install',
            '```sh',
            'npm install unleash',
            '```',
            '',
            '2\\. Run Unleash',
            '```js',
            'const u = initialize({ url });',
            "setInterval(() => console.log(u.isEnabled('<YOUR_FLAG>')), 1000);",
            '```',
        ].join('\n');

        expect(buildFlagUsageSnippet(raw, 'checkout')).toBe(
            "```js\nconst u = initialize({ url });\nsetInterval(() => console.log(u.isEnabled('checkout')), 1000);\n```",
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

        expect(buildFlagUsageSnippet(raw, 'x')).toBe(
            "```jsx\nuseFlag('x')\n```",
        );
    });

    it('replaces every occurrence of the <YOUR_FLAG> placeholder', () => {
        const raw = [
            '```js',
            "const a = isEnabled('<YOUR_FLAG>');",
            "const b = isEnabled('<YOUR_FLAG>');",
            '```',
        ].join('\n');

        expect(buildFlagUsageSnippet(raw, 'flag-x')).toBe(
            "```js\nconst a = isEnabled('flag-x');\nconst b = isEnabled('flag-x');\n```",
        );
    });

    it('returns an empty string when there are no code blocks', () => {
        expect(buildFlagUsageSnippet('just prose, no fences', 'x')).toBe('');
        expect(buildFlagUsageSnippet('', 'x')).toBe('');
    });
});
