/**
 * Given a raw onboarding markdown snippet (e.g. `react.md`), returns a
 * markdown string containing the flag-usage code block with the
 * `<YOUR_FLAG>` placeholder replaced by the given feature name.
 *
 * Onboarding snippets have the shape:
 *
 *     1. Install …
 *     ```sh …```
 *     2. Initialize …
 *     ```js …```
 *     ---
 *     ```… production variant …```
 *     ---
 *     - resource links
 *     ---
 *     ```… explicit flag usage example …```
 *
 * We take the 3rd `---` section which is a dedicated flag-usage snippet.
 */
export const buildFlagUsageSnippet = (
    rawSnippet: string,
    feature: string,
): string | null => {
    const sections = rawSnippet.split('---\n');
    const lastSection = sections[3];
    if (!lastSection) return null;

    return lastSection.replaceAll('<YOUR_FLAG>', feature);
};
