# Website

This website is built using [Docusaurus 2](https://docusaurus.io/), a modern static website generator.

## Installation

In a terminal, cd into the website folder of the locally cloned unleash repository and then start the installation.

```console
cd unleash/website
yarn install
```

## Generate OpenAPI docs

```console
yarn generate
```

Generate the Open API docs that live at Reference documentation > APIs > OpenAPI

## Local Development

Before running the docs the first time, you'll need to generate external documentation, as described in the [generate OpenAPI docs](#generate-openapi-docs) section.

```console
yarn start
```

Start a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

## Build

```console
yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

## Deployment

```console
GIT_USER=<Your GitHub username> USE_SSH=true yarn deploy
```

If you are using GitHub pages for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch.

## Troubleshooting

### `TypeError: source_default(...).bold is not a function`

If you get an error like this, it's probably due to a formatting issue within one of the markdown files. It could be

- unescaped angle brackets (markdown will try to parse `<your-key>` (when it's not quoted) as HTML, which breaks the build)
- incorrectly formatted titles or missing pieces of files
- a lot of other stuff.

```console
Component Figure was not imported, exported, or provided by MDXProvider as global scope

TypeError: source_default(...).bold is not a function
[ERROR] Unable to build website for locale en.
```

This error is very hard to debug, but there is a trick that appears to work (as shared in [this discussion on docusaurus' repo](https://github.com/facebook/docusaurus/issues/7686#issuecomment-1486771382)):

In `node_modules/@docusaurus/core/lib/client/serverEntry.js`, remove all references to `chalk`. You can use a regex replace for that, by replacing `chalk(\w|\.)+` with the empty string.

Depending on your editor, that regex might need more escapes. For instance, here's a command to run with `evil-ex` in Emacs:

```
%s/chalk\(\w\|\.\)+//g
```

For macOS `sed`, it'd be:

```shell
sed -i '' 's/chalk\(\w\|\.\)\+//g' node_modules/@docusaurus/core/lib/client/serverEntry.js
```

For GNU `sed`:

```shell
sed -i 's/chalk\(\w\|\.\)\+//g' node_modules/@docusaurus/core/lib/client/serverEntry.js
```

That might turn your error into something like this:

```console
[ERROR] Docusaurus server-side rendering could not render static page with path /reference/api/unleash/change-requests.
[ERROR] Docusaurus server-side rendering could not render static page with path /reference/api/unleash/feature-types.
[ERROR] Docusaurus server-side rendering could not render static page with path /reference/api/unleash/frontend-api.
[ERROR] Docusaurus server-side rendering could not render static page with path /reference/api/unleash/maintenance.
[ERROR] Docusaurus server-side rendering could not render static page with path /reference/api/unleash/notifications.
[ERROR] Docusaurus server-side rendering could not render static page with path /reference/api/unleash/personal-access-tokens.
[ERROR] Docusaurus server-side rendering could not render static page with path /reference/api/unleash/segments.
[ERROR] Docusaurus server-side rendering could not render static page with path /reference/api/unleash/service-accounts.
[ERROR] Docusaurus server-side rendering could not render static page with path /reference/api/unleash/telemetry.
[ERROR] Docusaurus server-side rendering could not render static page with path /reference/api/unleash/unstable.
Component Figure was not imported, exported, or provided by MDXProvider as global scope

Error: Unexpected: cant find current sidebar in context
[ERROR] Unable to build website for locale en.
```
