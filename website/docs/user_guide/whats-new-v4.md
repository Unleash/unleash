---
id: v4-whats-new
title: What's new in v4?
---

Version 4 of Unleash brings a lot of improvements to Unleash. In this document we will highlight some of the things that has been added.

### Upgrade with ease {#upgrade-with-ease}

Unleash can either be hosted by us or self-hosted. If you have a managed Unleash Enterprise instance you are automatically upgraded to version 4. If you manage Unleash yourself (either Open-Source or Enterprise Self-hosted) we recommend reading the [migration guide](deploy/migration-guide.md).

**PS! The first time you access Unleash v4 from a self-hosted instance you will need to login with the default admin user:**

- username: `admin`
- password: `unleash4all`

_(We recommend changing the password of the default user from the admin section.)_

### Role-Based Access Control {#role-based-access-control}

With Role-Based Access Control you can now assign groups to users in order to control access. You can control access to root resources in addition to controlling access to [projects](projects.md). _Please be aware that all existing users will become "Owner" of all existing projects as part of the migration from v3 to v4._

[Read more](rbac.md)

### New Addons {#new-addons}

Addons make it easy to integrate Unleash with other systems. In version 4 we bring two new integrations to Unleash:

- [Microsoft Teams](../addons/teams)
- [Datadog](addons/datadog.md)

### Improved UX {#improved-ux}

Unleash v4 includes a new implementation of the frontend based on [Material-ui](https://material-ui.com). This will make it much easier for us to improve the Unleash Admin UI and our ambition is to make it intuitive to use even for non-developers. The improved UX is made available in Unleash Open-Source and Unleash Enterprise.

### New SSO Option {#new-sso-option}

In version 4 we added support for [OpenID Connect](https://openid.net/connect/) as part of the Unleash Enterprise offering. OpenID Connect is a simple identity layer on top of the OAuth 2.0 protocol. It allows Clients to verify the identity of the End-User based on the authentication performed by an Authorization Server, as well as to obtain basic profile information about the End-User in an interoperable and REST-like manner.

### User Management {#user-management}

In version 4 we improved the User Management and made it available for Unleash Open-Source and Unleash Enterprise. Starting in v4 all users accessing Unleash needs to exist in Unleash in order to gain access (because they need to have the proper permission from RBAC.)

[Read more](user-management.md)

### API access {#api-access}

In version 4 we improved the API Access and made it available for Unleash Open-Source and Unleash Enterprise. Starting from Unleash v4 we require all SDKs to use an access token in order to connect to Unleash.

[Read more](advanced/api_access.md)

### Custom stickiness {#custom-stickiness}

In Unleash Enterprise v4 you can configure stickiness when you are
doing a gradual rollout with the "gradual rollout" strategy (previously known as "flexible rollout") or together with feature toggle variants. This means that you can now have consistent behavior based on any field available on the [Unleash context](unleash-context.md).
