// Description:
//
// ## What
//
// This script replaces all references to the Unleash ushosted instance in the
// generated OpenAPI docs. It removes extra path segments (such as leading
// `/ushosted` instances) and replaces the ushosted base url with something
// user-agnostic.
//
// ## Why
//
// When we host the OpenAPI docs in our official documentation, the generated
// docs shouldn't necessarily point at _one specific instance_, and especially
// not one that the reader is unlikely to ever use. Instead, we can remove all
// the bits that are specific to the generation source we use, and make the docs
// easier to use. In particular, removing the leading `/ushosted` is likely to
// save us loooots of questions.
const replace = require('replace-in-file');

const options = {
    files: 'docs/reference/api/**/*.api.mdx',
    from: [
        /\/ushosted/g,
        /"https:\/\/us.app.unleash-hosted.com(\/ushosted)?"/g,
        '"path":["ushosted",',
    ],
    to: ['', '"<your-unleash-url>"', '"path":['],
};

replace(options);

// remove unused tag files: https://github.com/Unleash/unleash/pull/2402
const fs = require('fs');

const unleashOpenApiDirectory = './docs/reference/api/unleash';
const unleashApiSidebar = require(`${unleashOpenApiDirectory}/sidebar.js`);

const tagsInSidebar = new Set(
    unleashApiSidebar
        .map((item) => item.link?.id)
        .filter(Boolean)
        .map((link) => link.substring(link.lastIndexOf('/') + 1)),
);

const tagsInFiles = fs
    .readdirSync(unleashOpenApiDirectory)
    .filter((file) => file.endsWith('.tag.mdx'))
    .map((file) => file.substring(0, file.indexOf('.')));

const unusedTags = tagsInFiles.filter((tag) => !tagsInSidebar.has(tag));

for (const tag of unusedTags) {
    const file = `${unleashOpenApiDirectory}/${tag}.tag.mdx`;
    fs.rmSync(file);
    console.info('Deleted unused OpenAPI tag file:', file);
}
