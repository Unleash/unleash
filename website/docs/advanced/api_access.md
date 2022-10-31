---
id: api_access
title: How to use the Admin API
---

It is possible to integrate directly with the Admin API. In this guide we will explain all the steps to set it up.

## Step 1: Create API token {#step-1-create-api-token}

You'll need either an [admin token](../reference/api-tokens-and-client-keys.mdx#admin-tokens) or a [personal access token](../reference/api-tokens-and-client-keys.mdx#personal-access-tokens) for this to work. To create one, follow the steps in the [_how to create API tokens_](../user_guide/token.mdx) guide or the [_how to create personal access tokens_](how-to/how-to-create-personal-access-tokens) guide, respectively.

Please note that it may take up to 60 seconds for the new key to propagate to all Unleash instances due to eager caching.

:::note

If you need an API token to use in a client SDK you should create a "client token" as these have fewer access rights.

:::

## Step 2: Use Admin API {#step-2-use-admin-api}

Now that you have an access token with admin privileges we can use that to perform changes in our Unleash instance.

In the example below we will use the [Unleash Admin API](../api/admin/features) to enable the “Demo” feature toggle using curl.

```sh
curl -X POST -H "Content-Type: application/json" \
     -H "Authorization: some-token" \
     https://app.unleash-hosted.com/demo/api/admin/features/Demo/toggle/on
```

**Great success!** We have now enabled the feature toggle. We can also verify that it was actually changed by the API user by navigating to the Event log (history) for this feature toggle.

![A feature toggle's event log showing that it was last updated by "admin-api".](/img/api_access_history.png)

## API overview {#api-overview}

You can find the full documentation on everything the Unleash API supports in the [Unleash API documentation](../api/admin/features).
