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

import fs from 'node:fs/promises';
import path from 'node:path';

const url = 'https://us.app.unleash-hosted.com/ushosted/docs/openapi.json';

// Fetch the OpenAPI spec
const response = await fetch(url);
if (!response.ok) {
    throw new Error(`Failed to fetch OpenAPI spec: ${response.statusText}`);
}

const data = await response.json();

data.servers = [
    {
        url: '<your-unleash-url>',
    },
];

const outputDir = './docs/generated/';

// Write the JSON to file
const outputPath = path.join(outputDir, 'openapi.json');

// Ensure directory exists
await fs.mkdir(outputDir, { recursive: true });

await fs.writeFile(
    outputPath,
    JSON.stringify(data, null, 2).replace(
        /\/ushosted\/openapi-static/g,
        '/openapi-static',
    ),
    'utf8',
);

console.log(`OpenAPI spec saved to ${outputPath}`);
