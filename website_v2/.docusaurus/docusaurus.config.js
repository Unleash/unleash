export default {
  "title": "Unleash",
  "tagline": "The enterprise ready feature toggle service",
  "url": "https://docs.getunleash.io",
  "baseUrl": "/",
  "organizationName": "Unleash",
  "projectName": "unleash.github.io",
  "scripts": [
    "https://buttons.github.io/buttons.js"
  ],
  "favicon": "img/favicon/favicon.ico",
  "customFields": {
    "users": [
      {
        "caption": "FINN.no",
        "image": "/img/finn.jpg",
        "infoLink": "https://www.finn.no",
        "pinned": true
      },
      {
        "caption": "NAV.no",
        "image": "/img/nav.jpg",
        "infoLink": "https://www.nav.no",
        "pinned": true
      },
      {
        "caption": "Unleash Hosted",
        "image": "/img/unleash-hosted.svg",
        "infoLink": "https://www.unleash-hosted.com",
        "pinned": true
      },
      {
        "caption": "Budgets",
        "image": "/img/budgets.png",
        "infoLink": "https://budgets.money",
        "pinned": true
      },
      {
        "caption": "Otovo",
        "image": "/img/otovo.png",
        "infoLink": "https://www.otovo.com",
        "pinned": true
      },
      {
        "caption": "Amedia",
        "image": "/img/amedia-logo.png",
        "infoLink": "https://www.amedia.no/",
        "pinned": true
      }
    ],
    "repoUrl": "https://github.com/unleash/unleash",
    "gaGtag": true
  },
  "onBrokenLinks": "log",
  "onBrokenMarkdownLinks": "log",
  "presets": [
    [
      "@docusaurus/preset-classic",
      {
        "docs": {
          "path": "../docs",
          "showLastUpdateAuthor": true,
          "showLastUpdateTime": true,
          "sidebarPath": "./sidebars.json"
        },
        "blog": {},
        "theme": {
          "customCss": "../src/css/customTheme.css"
        }
      }
    ]
  ],
  "plugins": [],
  "themeConfig": {
    "navbar": {
      "title": "Unleash",
      "logo": {
        "src": "img/logo-inverted.png"
      },
      "items": [
        {
          "to": "docs/",
          "label": "Documentation",
          "position": "left"
        },
        {
          "to": "docs/deploy/getting_started",
          "label": "Deploy and manage",
          "position": "left"
        },
        {
          "to": "docs/integrations/integrations",
          "label": "Integrations",
          "position": "left"
        },
        {
          "to": "docs/developer_guide",
          "label": "Contribute",
          "position": "left"
        },
        {
          "to": "docs/api/client/features",
          "label": "API",
          "position": "left"
        },
        {
          "href": "https://www.unleash-hosted.com/open-source",
          "label": "Enterprise",
          "position": "left"
        },
        {
          "to": "/help",
          "label": "Help",
          "position": "left"
        }
      ],
      "hideOnScroll": false
    },
    "image": "img/unleash_logo.png",
    "footer": {
      "links": [],
      "copyright": "Copyright © 2021",
      "logo": {
        "src": "img/logo-inverted.png"
      },
      "style": "light"
    },
    "gtag": {
      "trackingID": "UA-134882379-1"
    },
    "colorMode": {
      "defaultMode": "light",
      "disableSwitch": false,
      "respectPrefersColorScheme": false,
      "switchConfig": {
        "darkIcon": "🌜",
        "darkIconStyle": {},
        "lightIcon": "🌞",
        "lightIconStyle": {}
      }
    },
    "docs": {
      "versionPersistence": "localStorage"
    },
    "metadatas": [],
    "prism": {
      "additionalLanguages": []
    },
    "hideableSidebar": false
  },
  "baseUrlIssueBanner": true,
  "i18n": {
    "defaultLocale": "en",
    "locales": [
      "en"
    ],
    "localeConfigs": {}
  },
  "onDuplicateRoutes": "warn",
  "themes": [],
  "titleDelimiter": "|",
  "noIndex": false
};