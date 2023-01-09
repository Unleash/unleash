// Type definitions
//
// type Readme = {
//     // This is the name that is placed before "SDK" in the sidebar.
//     sidebarName: string;
//
//     // The repo's primary branch. Falls back to "main" if nothing is defined
//     branch?: string;
//
//     // If present, this will be used to construct the slug. If no "slugName" is
//     // defined, the `sidebarName` will be used to create the slug.
//     slugName?: string;
// };
//
// type ReadmeData = Readme & { repoUrl: string };

// all SDK repos and what they map to for the sidebar.
const sdksUnmapped = {
    'unleash-client-go': {
        sidebarName: 'Go',
        branch: 'v3',
    },
    'unleash-client-java': {
        sidebarName: 'Java',
    },
    'unleash-client-node': {
        sidebarName: 'Node',
    },
    'unleash-client-php': {
        sidebarName: 'PHP',
    },
    'unleash-client-python': {
        sidebarName: 'Python',
    },
    'unleash-client-ruby': {
        sidebarName: 'Ruby',
    },
    'unleash-client-rust': {
        sidebarName: 'Rust',
    },
    'unleash-client-dotnet': {
        sidebarName: '.NET',
        slugName: 'dotnet',
    },

    // 'unleash-android-proxy-sdk': {
    //     sidebarName: 'Android',
    //     slugName: 'android-proxy',
    // },
};

const SDKS = Object.fromEntries(
    Object.entries(sdksUnmapped).map(([repoName, repoData]) => {
        const repoUrl = `https://github.com/Unleash/${repoName}`;
        const slugName = (
            repoData.slugName ?? repoData.sidebarName
        ).toLowerCase();
        const branch = repoData.branch ?? 'main';

        return [repoName, { ...repoData, repoUrl, slugName, branch }];
    }),
);

function getReadmeRepoData(filename) {
    const repoName = filename.split('/')[0];

    const repoData = SDKS[repoName];

    return repoData;
}

const documentUrls = Object.entries(SDKS).map(
    ([repo, { branch }]) => `${repo}/${branch}/README.md`,
);

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

const modifyContent = (filename, content) => {
    const sdk = getReadmeRepoData(filename);

    const generationTime = new Date();

    return {
        filename: `${sdk.slugName}.md`,
        content: `---
title: ${sdk.sidebarName} SDK
---

:::info Generated content
This document was generated from the README in the [${
            sdk.sidebarName
        } SDK's GitHub repository](${sdk.repoUrl}).
:::

:::tip Connecting to Unleash
To connect to Unleash, you'll need your Unleash API url (e.g. \`https://<your-unleash>/api\`) and a [server-side API token](/reference/api-tokens-and-client-keys.mdx#client-tokens) ([how do I create an API token?](/how-to/how-to-create-api-tokens.mdx)).
:::

${replaceLinks({ content, repo: { url: sdk.repoUrl, branch: sdk.branch } })}

---

This content was generated on <time datetime="${generationTime.toISOString()}">${generationTime.toLocaleString(
            'en-gb',
            { dateStyle: 'long', timeStyle: 'full' },
        )}</time>
`,
    };
};

module.exports.readmes = {
    documentUrls,
    modifyContent,
};
