import { describe, expect, it } from 'vitest';
import { buildFlagUsageSnippet } from './buildFlagUsageSnippet.ts';
import { codeRenderSnippets } from 'component/onboarding/dialog/CodeRenderer';

describe('buildFlagUsageSnippet', () => {
    it('extracts the code block from the last section of the snippet', () => {
        const raw = [
            '```sh',
            'npm install foo',
            '```',
            '---',
            '```jsx',
            'const config = { token: process.env.TOKEN };',
            '```',
            '---',
            '- [docs](https://example.com)',
            '---',
            '```jsx',
            "if (useFlag('<YOUR_FLAG>')) {",
            "    return 'enabled';",
            '} else {',
            "    return 'disabled';",
            '}',
            '```',
        ].join('\n');

        expect(buildFlagUsageSnippet(raw, 'my-flag')).toBe(
            "```jsx\nif (useFlag('my-flag')) {\n    return 'enabled';\n} else {\n    return 'disabled';\n}\n```",
        );
    });

    it('replaces every occurrence of the flag placeholder', () => {
        const raw = [
            '---',
            '---',
            '---',
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

describe('every SDK snippet has a flag usage section', () => {
    it.each(
        Object.entries(codeRenderSnippets),
    )('%s has a non-empty flag usage snippet', (_sdkName, snippet) => {
        const result = buildFlagUsageSnippet(snippet, 'test-flag');
        expect(result.trim()).not.toBe('');
    });
});
