const path = require('path');

module.exports.mapObject = (fn) => (o) =>
    Object.fromEntries(Object.entries(o).map(fn));

module.exports.enrichAdditional =
    (additionalProperties) =>
    ([repoName, repoData]) => {
        const repoUrl = `https://github.com/Unleash/${repoName}`;
        const slugName = (
            repoData.slugName ?? repoData.sidebarName
        ).toLowerCase();
        const branch = repoData.branch ?? 'main';

        return [
            repoName,
            { ...repoData, repoUrl, slugName, branch, ...additionalProperties },
        ];
    };
module.exports.enrich = module.exports.enrichAdditional({});

module.exports.getRepoData = (documents) => (filename) => {
    const repoName = filename.split('/')[0];

    const repoData = documents[repoName];

    return repoData;
};

// Replace links in the incoming readme content.
//
// There's one cases we want to handle:
//
// 1. Relative links that point to the repo. These must be prefixed with the
// link to the github repo.
//
// Note: You might be tempted to handle absolute links to docs.getunleash.io and
// make them relative. While absolute links will work, they trigger full page
// refreshes. Relative links give a slightly smoother user experience.
//
// However, if the old link goes to a redirect, then the client-side redirect
// will not kick in, so you'll end up with a "Page not found".
const replaceLinks = ({ content, repo }) => {
    const markdownLink = /(?<=\[.*\]\(\s?)([^\s\)]+)(?=.*\))/g;

    const replacer = (url) => {
        try {
            // This constructor will throw if the URL is relative.
            // https://developer.mozilla.org/en-US/docs/Web/API/URL/URL
            new URL(url);

            return url;
        } catch {
            // case 1
            if (url.startsWith('#')) {
                // ignore links to other doc sections
                return url;
            } else {
                const separator = url.startsWith('/') ? '' : '/';
                return `${repo.url}/blob/${repo.branch}${separator}${url}`;
            }
        }
    };

    return content.replaceAll(markdownLink, replacer);
};

module.exports.modifyContent =
    ({ getRepoDataFn, filePath, urlPath, getAdditionalAdmonitions }) =>
    (filename, content) => {
        console.log('got here');
        const data = getRepoDataFn(filename);

        const generationTime = new Date();

        const processedFilename = (() => {
            const constructed =
                path.join(filePath ?? '', data.slugName) + '.md';

            // ensure the file path does *not* start with a leading /
            return constructed.charAt(0) === '/'
                ? constructed.slice(1)
                : constructed;
        })();

        const processedSlug = (() => {
            const constructed = path.join(urlPath ?? '', data.slugName);
            // ensure the slug *does* start with a leading /
            const prefix = constructed.charAt(0) === '/' ? '' : '/';

            return prefix + constructed;
        })();

        const additionalAdmonitions = (
            getAdditionalAdmonitions(data) ?? []
        ).join('\n\n');

        return {
            filename: processedFilename,
            content: `---
title: ${data.sidebarName}
slug: ${processedSlug}
---

:::info Generated content
This document was generated from the README in the [${
                data.sidebarName
            } GitHub repository](${data.repoUrl}).
:::

${additionalAdmonitions}

${replaceLinks({ content, repo: { url: data.repoUrl, branch: data.branch } })}

---

This content was generated on <time datetime="${generationTime.toISOString()}">${generationTime.toLocaleString(
                'en-gb',
                { dateStyle: 'long', timeStyle: 'full' },
            )}</time>
`,
        };
    };

module.exports.getUrls = (documents) =>
    Object.entries(documents).map(
        ([repo, { branch }]) => `${repo}/${branch}/README.md`,
    );
