---
id: scim
title: Provisioning
---

import SearchPriority from '@site/src/components/SearchPriority';

<SearchPriority level="high" />

:::note Availability

**Plan**: [Enterprise](https://www.getunleash.io/pricing) | **Version**: `6.1+`

:::

[SCIM](https://scim.cloud/) automates user and group provisioning between an identity provider (IdP) and an application like Unleash. This makes it easy to manage users and groups directly through your [SSO](/concepts/sso) provider. This automation offers several key benefits:

- **Improved security**: When an employee leaves, their account is instantly deprovisioned, reducing security risks.
- **Reduced administrative overhead**: New team members are automatically given the correct permissions, eliminating the need for manual setup.
- **Consistency**: SCIM ensures that user access and group memberships are consistent and up-to-date across all connected applications. With SCIM, your IdP can sync groups lazily in the background, circumventing limitations on the number of users that can be synced with some SSO providers.

Our implementation supports user and group provisioning, but not password syncing or role mapping. It uses soft-deletes to preserve audit logs when you deprovision users.

See our how-to guides on setting up provisioning for [Okta](/provisioning/how-to-setup-provisioning-with-okta) or [Entra](/provisioning/how-to-setup-provisioning-with-entra).

## Retain admin access

When setting up a SCIM integration with Unleash, you must configure a method for role management to avoid being locked out of admin accounts. To do this, either assign the admin role to an IdP group that is synced with Unleash or create a dedicated, non-SCIM managed recovery admin account for emergency use. For full instructions, including what to do if you're already locked out, see our complete [troubleshooting guide](/support/troubleshooting#got-locked-out-of-an-admin-account-after-configuring-scim).
