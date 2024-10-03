---
title: Single Sign-On
---

:::note Availability

**Plan**: [Enterprise](https://www.getunleash.io/pricing)

:::

Unleash Enterprise supports SAML 2.0, OpenID Connect and Google Authentication. In addition, Unleash supports username/password authentication out of the box.

### Before you start

In order to configure Single-Sign-On you will need to log in to the Unleash instance with a user that have "Admin" role. If you are self-hosting Unleash then a default user will be automatically created the first time you start unleash:

- username: `admin`
- password: `unleash4all` _(or `admin` if you started with Unleash v3)._

## Guides

Unleash enterprise supports multiple authentication providers.

- [OpenID Connect with Okta](../how-to/how-to-add-sso-open-id-connect.md)
- [SAML 2.0 with Okta](../how-to/how-to-add-sso-saml.md)
- [SAML 2.0 with Keycloak](../how-to/how-to-add-sso-saml-keycloak.md)
- [SAML 2.0 with Microsoft Entra ID](../how-to/how-to-add-sso-azure-saml.md)
- [Google Authentication](../how-to/how-to-add-sso-google.md) (deprecated)
