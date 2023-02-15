const mapObject = (fn) => (o) => Object.fromEntries(Object.entries(o).map(fn));

const documents = {
    'unleash-proxy': {
        sidebarName: 'Unleash Proxy',
        slugName: 'unleash-proxy',
    },
    'unleash-edge': {
        sidebarName: 'Unleash Edge',
        slugName: 'unleash-edge',
    },
};

const DOCS = (() => {
    const enrich = ([repoName, repoData]) => {
        const repoUrl = `https://github.com/Unleash/${repoName}`;
        const slugName = (
            repoData.slugName ?? repoData.sidebarName
        ).toLowerCase();
        const branch = repoData.branch ?? 'main';

        return [repoName, { ...repoData, repoUrl, slugName, branch }];
    };

    return mapObject(enrich)(documents);
})();

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
            const parsedUrl = new URL(url);

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

const modifyProxyContent = (filename, content) => {
    function getRepoData(filename) {
        const repoName = filename.split('/')[0];

        const repoData = DOCS[repoName];

        return repoData;
    }

    const data = getRepoData(filename);

    const generationTime = new Date();

    return {
        filename: `${data.slugName}.md`,
        content: `---
title: ${data.sidebarName}
slug: /reference/${data.slugName}
---

:::info Generated content
This document was generated from the README in the [${
            data.sidebarName
        } GitHub repository](${data.repoUrl}).
:::


${replaceLinks({ content, repo: { url: data.repoUrl, branch: data.branch } })}

---

This content was generated on <time datetime="${generationTime.toISOString()}">${generationTime.toLocaleString(
            'en-gb',
            { dateStyle: 'long', timeStyle: 'full' },
        )}</time>
`,
    };
};

const urls = Object.entries(DOCS).map(
    ([repo, { branch }]) => `${repo}/${branch}/README.md`,
);

console.log('These are the urls!', urls);

module.exports.externalDocs = {
    urls,
    modifyContent: modifyProxyContent,
};
