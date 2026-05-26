import { describe, expect, it } from 'vitest';
import { buildFlagUsageSnippet } from './buildFlagUsageSnippet.ts';
import { codeRenderSnippets } from 'component/onboarding/dialog/CodeRenderer';

describe('buildFlagUsageSnippet', () => {
    it('extracts the code block from the third section of the snippet', () => {
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
            "    return '<YOUR_FLAG> enabled';",
            '} else {',
            "    return '<YOUR_FLAG> disabled';",
            '}',
            '```',
        ].join('\n');

        expect(buildFlagUsageSnippet(raw, 'my-flag')).toBe(
            "```jsx\nif (useFlag('my-flag')) {\n    return 'my-flag enabled';\n} else {\n    return 'my-flag disabled';\n}\n```",
        );
    });

    it('returns null when there is text in the snippet', () => {
        expect(buildFlagUsageSnippet('just prose, no fences', 'x')).toBeNull();
        expect(buildFlagUsageSnippet('', 'x')).toBeNull();
    });
});

describe('every SDK snippet has a flag usage section', () => {
    it.each(
        Object.entries(codeRenderSnippets),
    )('%s has a non-empty flag usage snippet', (_sdkName, snippet) => {
        const result = buildFlagUsageSnippet(snippet, 'test-flag');
        expect(result).not.toBeNull();
        expect(result!.trim()).not.toBe('');
    });
});
