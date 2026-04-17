/**
 * Given a raw onboarding markdown snippet (e.g. `react.md`), returns a
 * markdown string containing only the flag-usage code block with the
 * `<YOUR_FLAG>` placeholder replaced by the given feature name.
 *
 * Onboarding snippets have the shape:
 *
 *     1. Install …
 *     ```sh …```
 *     2. Initialize …
 *     ```js …```
 *     3. Check flag (optional third step)
 *     ```jsx …```
 *     ---
 *     ```… production variant …```
 *     ---
 *     - resource links
 *
 * We want just the flag-usage block. We take the content before the first
 * `---` separator and pick the last fenced code block from it, which is the
 * check-the-flag example for 3-step SDKs, or the combined init-and-check
 * block for 2-step SDKs (Node, Python).
 */
export const buildFlagUsageSnippet = (
    rawSnippet: string,
    feature: string,
): string => {
    const [connectSection] = rawSnippet.split('---\n');
    const lastBlock = extractLastCodeBlock(connectSection);
    if (!lastBlock) return '';
    const code = lastBlock.code.replaceAll('<YOUR_FLAG>', feature);
    return `\`\`\`${lastBlock.language}\n${code}\n\`\`\``;
};

const FENCED_CODE_BLOCK = /```(\w*)\n([\s\S]*?)```/g;

const extractLastCodeBlock = (markdown: string) => {
    const matches = [...markdown.matchAll(FENCED_CODE_BLOCK)];
    if (matches.length === 0) return null;
    const [, language, code] = matches[matches.length - 1];
    return { language, code: code.trim() };
};
