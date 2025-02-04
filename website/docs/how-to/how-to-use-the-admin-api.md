---
title: How to use the Admin API
---

This guide explains the steps required to using the Admin API.

## Create API token

First, you'll need to create a [personal access token](/reference/api-tokens-and-client-keys.mdx#personal-access-tokens).

Please note that it may take up to 60 seconds for the new key to propagate to all Unleash instances due to eager caching.

:::note

If you need an API token to use in a client SDK you should create a client token instead, as these have fewer access rights.

:::

## Use Admin API

Now that you have an access token with admin privileges, you can use it to make changes in your Unleash instance.

In the example below we will use the [Unleash Admin API](/reference/api/legacy/unleash/admin/features.md) to enable the `checkout-flow` feature flag in `development` using curl.

```sh
curl -X POST -H "Content-Type: application/json" \
     -H "Authorization: <your-token>" \
     https://app.unleash-hosted.com/docs-demo/api/admin/projects/docs-project/features/checkout-flow/environments/development/on
```

We have now enabled the feature flag. We can also verify that it was actually changed by the API user by navigating to [Event Log](/reference/events#event-log) and filtering events for this feature flag.

![Feature flag events showing that it was last updated by "admin-api".](/img/api_access_history.png)

You can find the full documentation on everything the Unleash API supports in the [Unleash API documentation](/reference/api/legacy/unleash/admin/features.md).
