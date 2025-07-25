import path from 'node:path';

export const mapObject = (fn) => (o) =>
    Object.fromEntries(Object.entries(o).map(fn));

export const enrichAdditional =
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

export const enrich = enrichAdditional({});

export const getRepoData = (documents) => (filename) => {
    const repoName = filename.split('/')[0];

    const repoData = documents[repoName];

    return { name: repoName, ...repoData };
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
    const replace = (processRelativeUrl) => (url) => {
        try {
            // This constructor will throw if the URL is relative.
            // https://developer.mozilla.org/en-US/docs/Web/API/URL/URL
            new URL(url);

            return url;
        } catch {
            const separator = url.startsWith('/') ? '' : '/';
            return processRelativeUrl(url, separator);
        }
    };

    const replaceMarkdownLink = replace((url, separator) => {
        // case 1
        if (url.startsWith('#')) {
            // ignore links to other doc sections
            return url.toLowerCase();
        } else {
            return `${repo.url}/blob/${repo.branch}${separator}${url}`;
        }
    });

    const replaceImageSrcLink = replace((url, separator) => {
        return `https://raw.githubusercontent.com/Unleash/${repo.name}/${repo.branch}${separator}${url}`;
    });

    // matches the URL portion of markdown links like [I go here](path/link "comment")
    const markdownLink = /(?<=\[.*\]\(\s?)([^\s\)]+)(?=.*\))/g;

    // matches the URL portion of src links that contain an image file type
    // extension, e.g. src="./.github/img/get-request.png"
    const imageSrcLink = /(?<=src=")([^")]+\.(png|svg|jpe?g|webp|gif))(?=")/g;

    return content
        .replaceAll(markdownLink, replaceMarkdownLink)
        .replaceAll(imageSrcLink, replaceImageSrcLink);
};

export const modifyContent =
    ({
        getRepoDataFn,
        filePath = () => {},
        urlPath,
        getAdditionalAdmonitions,
    }) =>
    (filename, content) => {
        const data = getRepoDataFn(filename);
        const subpageKey = filename.replace(`${data.name}/${data.branch}/`, '');
        const subpage = data.subPages?.[subpageKey];

        //  Add search the priority level. Use the sub-page's priority if it exists,
        //  otherwise fall back to the main repository's priority.
        const priorityLevel = subpage?.searchPriority ?? data.searchPriority;

        // Create the component string, but only if a priority level was defined.
        const priorityComponent = priorityLevel
            ? `import SearchPriority from '@site/src/components/SearchPriority';\n\n<SearchPriority level="${priorityLevel}" />`
            : '';
        const generationTime = new Date();

        const processedFilename = (() => {
            const constructed = `${path.join(
                filePath(data) ?? '',
                data.slugName,
                subpage?.slugName ?? '',
            )}.md`;

            // ensure the file path does *not* start with a leading /
            return constructed.charAt(0) === '/'
                ? constructed.slice(1)
                : constructed;
        })();

        const processedSlug = (() => {
            const constructed = path.join(
                urlPath ?? '',
                data.slugName,
                subpage?.slugName ?? '',
            );
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
title: ${subpage?.sidebarName ?? data.sidebarName}
slug: ${processedSlug}
custom_edit_url: ${data.repoUrl}/edit/${data.branch}/${
                subpage ? subpageKey : 'README.md'
            }
---

${priorityComponent}

:::info Generated content
This document was generated from ${
                subpage ? subpageKey : 'README.md'
            } in the [${data.sidebarName} GitHub repository](${data.repoUrl}).
:::

${additionalAdmonitions}

${replaceLinks({
    content,
    repo: { url: data.repoUrl, branch: data.branch, name: data.name },
})}

---

This content was generated on <time dateTime="${generationTime.toISOString()}">${generationTime.toLocaleString(
                'en-gb',
                { dateStyle: 'long', timeStyle: 'full' },
            )}</time>
`,
        };
    };

export const getUrls = (documents) =>
    Object.entries(documents).flatMap(([repo, { branch, subPages }]) => [
        `${repo}/${branch}/README.md`,
        ...(Object.keys(subPages ?? {}).map(
            (remotePath) => `${repo}/${branch}/${remotePath}`,
        ) ?? []),
    ]);
