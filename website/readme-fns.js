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
const SDKS = {
    'unleash-client-go': {
        sidebarName: 'Go',
        branch: 'v3',
    },
    'unleash-client-rust': {
        sidebarName: 'Rust',
    },

    // 'unleash-android-proxy-sdk': {
    //     sidebarName: 'Android',
    //     slugName: 'android-proxy',
    // },
};

function getReadmeRepoData(filename) {
    const repoName = filename.split('/')[0];

    const repoData = SDKS[repoName];

    const repoUrl = `https://github.com/Unleash/${repoName}`;

    if (repoData) {
        return {
            repoUrl,
            ...repoData,
            slugName: (repoData.slugName ?? repoData.sidebarName).toLowerCase(),
        };
    } else return { sidebarName: repoName, repoUrl };
}

const documentUrls = Object.entries(SDKS).map(
    ([repo, { branch = 'main' }]) => `${repo}/${branch ?? 'main'}/README.md`,
);

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

${content}

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
