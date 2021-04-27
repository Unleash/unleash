'use strict';

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// See https://docusaurus.io/docs/site-config for all the possible
// site configuration options.

// List of projects/orgs using your project for the users page.
const users = [
    {
        caption: 'FINN.no',
        // You will need to prepend the image path with your baseUrl
        // if it is not '/', like: '/test-site/img/docusaurus.svg'.
        image: '/img/finn.jpg',
        infoLink: 'https://www.finn.no',
        pinned: true,
    },
    {
        caption: 'NAV.no',
        // You will need to prepend the image path with your baseUrl
        // if it is not '/', like: '/test-site/img/docusaurus.svg'.
        image: '/img/nav.jpg',
        infoLink: 'https://www.nav.no',
        pinned: true,
    },
    {
        caption: 'Unleash Hosted',
        image: '/img/unleash-hosted.svg',
        infoLink: 'https://www.unleash-hosted.com',
        pinned: true,
    },
    {
        caption: 'Budgets',
        image: '/img/budgets.png',
        infoLink: 'https://budgets.money',
        pinned: true,
    },
    {
        caption: 'Otovo',
        image: '/img/otovo.png',
        infoLink: 'https://www.otovo.com',
        pinned: true,
    },
    {
        caption: 'Amedia',
        image: '/img/amedia-logo.png',
        infoLink: 'https://www.amedia.no/',
        pinned: true,
    },
];

const siteConfig = {
    title: 'Unleash', // Title for your website.
    tagline: 'The enterprise ready feature toggle service',
    url: 'https://docs.getunleash.io', // Your website URL
    baseUrl: '/', // Base URL for your project */
    // For github.io type URLs, you would set the url and baseUrl like:
    //   url: 'https://facebook.github.io',
    //   baseUrl: '/test-site/',

    // Used for publishing and more
    projectName: 'unleash.github.io',
    organizationName: 'Unleash',
    // For top-level user or org sites, the organization is still the same.
    // e.g., for the https://JoelMarcey.github.io site, it would be set like...
    //   organizationName: 'JoelMarcey'

    // For no header links in the top nav bar -> headerLinks: [],
    headerLinks: [
        { doc: 'user_guide/index', label: 'Documentation' },
        { doc: 'deploy/getting_started', label: 'Deploy and manage' },
        { doc: 'integrations/integrations', label: 'Integrations' },
        { doc: 'developer_guide', label: 'Contribute' },
        { doc: 'api/client/features', label: 'API' },
        { href: 'https://www.unleash-hosted.com/pricing', label: 'Enterprise' },
        { page: 'help', label: 'Help' },
        // {blog: true, label: 'Blog'},
    ],

    // If you have users set above, you add it here:
    users,

    /* path to images for header/footer */
    headerIcon: 'img/logo-inverted.png',
    footerIcon: 'img/logo-inverted.png',
    favicon: 'img/favicon/favicon.ico',

    /* Colors for website */
    colors: {
        primaryColor: '#3f51b5',
        secondaryColor: '#697ce5',
    },

    /* Custom fonts for website */
    /*
  fonts: {
    myFont: [
      "Times New Roman",
      "Serif"
    ],
    myOtherFont: [
      "-apple-system",
      "system-ui"
    ]
  },
  */

    // This copyright info is used in /core/Footer.js and blog RSS/Atom feeds.
    copyright: `Copyright © ${new Date().getFullYear()}`,

    highlight: {
        // Highlight.js theme to use for syntax highlighting in code blocks.
        theme: 'default',
    },

    // Add custom scripts here that would be placed in <script> tags.
    scripts: ['https://buttons.github.io/buttons.js'],

    // On page navigation for the current documentation page.
    onPageNav: 'separate',
    // No .html extensions for paths.
    cleanUrl: true,

    // Open Graph and Twitter card images.
    ogImage: 'img/unleash_logo.png',
    twitterImage: 'img/unleash_logo.png',

    // Show documentation's last contributor's name.
    // enableUpdateBy: true,

    // Show documentation's last update time.
    // enableUpdateTime: true,

    // You may provide arbitrary config keys to be used as needed by your
    // template. For example, if you need your repo's URL...
    repoUrl: 'https://github.com/unleash/unleash',

    gaTrackingId: 'UA-134882379-1',
    gaGtag: true,
};

module.exports = siteConfig;
