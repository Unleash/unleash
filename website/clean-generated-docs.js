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

const escapeCharacters = (input) => {
    unquotedInput =
        input.charAt(0) === '"' ? input.substring(1, input.length - 1) : input;
    const fixed = unquotedInput.replace(/(?<!\\)"/g, '\\"');
    return `"${fixed}"`;
};

const options = {
    files: 'docs/reference/api/**/*.api.mdx',
    from: [
        /\/ushosted/g,
        /"https:\/\/us.app.unleash-hosted.com(\/ushosted)?"/g,
        '"path":["ushosted",',
        /^(sidebar_label|title): (.+)/gm, // escape potentially unescaped, single-line text fields
    ],
    to: [
        '',
        '"<your-unleash-url>"',
        '"path":[',
        (_, key, description) => `${key}: ${escapeCharacters(description)}`,
    ],
};

replace(options);
