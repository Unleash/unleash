The Unleash website was created with [Docusaurus](https://docusaurus.io/). The source code lives as part of the main [Unleash repo on GitHub](https://github.com/Unleash/unleash) and is built and deployed on all merges to main. This makes it easy to keep the documentation in sync with the latest version of Unleash.

It's hosted on https://docs.getunleash.io

# What's In This Document

- [Get Started in 5 Minutes](#get-started-in-5-minutes)
- [Directory Structure](#directory-structure)
- [Editing Content](#editing-content)
- [Adding Content](#adding-content)
- [Full Documentation](#full-documentation)

# Get Started in 5 Minutes

1. Make sure all the dependencies for the website are installed:

```sh
# Install dependencies
$ npm install
```

2. Run your dev server:

```sh
# Start the site
$ npm run start
```

## Directory Structure

Your project file structure should look something like this

```
unleash/
  website/
    /docs
        doc-1.md
        doc-2.md
        doc-3.md
    static/
      css/
      img/
    package.json
    sidebar.json
    docusaurus.config.js
```

# Editing Content

## Editing an existing docs page

Edit docs by navigating to `docs/` and editing the corresponding document:

`docs/doc-to-be-edited.md`

```markdown
---
id: page-needs-edit
title: This Doc Needs To Be Edited
---

Edit me...
```

For more information about docs, click [here](https://docusaurus.io/docs/en/navigation)

# Adding Content

## Adding a new docs page to an existing sidebar

1. Create the doc as a new markdown file in `/docs`, example `docs/newly-created-doc.md`:

```md
---
id: newly-created-doc
title: This Doc Needs To Be Edited
---

My new content here..
```

1. Refer to that doc's ID in an existing sidebar in `website/sidebars.json`:

```javascript
// Add newly-created-doc to the Getting Started category of docs
{
  "docs": {
    "Getting Started": [
      "quick-start",
      "newly-created-doc" // new doc here
    ],
    ...
  },
  ...
}
```

For more information about adding new docs, click [here](https://docusaurus.io/docs/en/navigation)

## Adding items to your site's top navigation bar

1. Add links to docs, custom pages or external links by editing the headerLinks field of `website/siteConfig.js`:

`website/siteConfig.js`

```javascript
{
  headerLinks: [
    ...
    /* you can add docs */
    { doc: 'my-examples', label: 'Examples' },
    /* you can add custom pages */
    { page: 'help', label: 'Help' },
    /* you can add external links */
    { href: 'https://github.com/facebook/Docusaurus', label: 'GitHub' },
    ...
  ],
  ...
}
```

For more information about the navigation bar, click [here](https://docusaurus.io/docs/en/navigation)

# Full Documentation

Full documentation can be found on the [website](https://docusaurus.io/).
