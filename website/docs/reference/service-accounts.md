---
title: Service accounts
---

:::info

Service accounts is an enterprise feature available from Unleash 4.21 onwards.

:::

Service accounts are accounts that act as normal Unleash users and that respect the same set of permissions, but that don't represent real users. These accounts do not have a password and cannot log in to the Unleash UI. Instead, they are intended to be used to access the Unleash API programmatically, providing integrations an identity.

![Service account table](/img/service-account-table.png)

Use service accounts to:

- Provide a user-like identity to an integration or automation and manage it within Unleash
- Give access to the Unleash API without giving access to the Unleash UI
- Provide more fine-grained permissions than an admin token provides

In order to create a service account, you can follow the [how to create service accounts](../how-to/how-to-create-service-accounts.mdx) guide.

## Service account tokens

Service account tokens allow service accounts to use the Admin API as themselves with their own set of permissions, rather than using an admin token. See [_how to use the Admin API_](../how-to/how-to-use-the-admin-api.md) for more information.

These tokens act just like [personal access tokens](./api-tokens-and-client-keys.mdx#personal-access-tokens) for the service accounts, except that they are managed by Unleash admins.

When using a service account token to modify resources, the event log will display the service account name for that operation.

Service account tokens can be managed by editing the respective service account: 

![Service account tokens](/img/service-account-tokens.png)
