---
id: enterprise-authentication
title: Single-Sign-On
---

> The **Single-Sign-On capability** is only available for customers on the Enterprise subscription. Check out the [Unleash plans](https://www.getunleash.io/plans) for details.

Unleash Enterprise supports SAML 2.0, OpenID Connect and Google Authentication. In addition, Unleash supports username/password authentication out of the box.

### Before you start

In order to configure Single-Sign-On you will need to log in to the Unleash instance with a user that have "Admin" role. If you are self-hosting Unleash then a default user will be automatically created the first time you start unleash:

- username: `admin`
- password: `unleash4all` _(or `admin` if you started with Unleash v3)._

## Guides

Unleash enterprise supports multiple authentication providers.

- [OpenID Connect with Okta](./sso-open-id-connect.md)
- [SAML 2.0 with Okta](./sso-saml.md)
- [SAML 2.0 with Keycloak](./sso-saml-keycloak.md)
- [Google Authentication](./sso-google.md) (deprecated)
