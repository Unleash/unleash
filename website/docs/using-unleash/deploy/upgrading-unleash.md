---
title: Upgrading Unleash
---
import VideoContent from '@site/src/components/VideoContent.jsx'

Generally, the intention is that `unleash-server` should always provide support for clients one major version lower than the current one. This should make it possible to upgrade `unleash` gradually.

## Upgrading to v6 from v5

[Unleash v6](https://github.com/Unleash/unleash/issues/4380) was released on June 6th, 2024. **We expect this upgrade to be straightforward**, provided you have followed the previous migration guides on this page. We're removing some features that were deprecated in version 5 and marking some features as deprecated, but these will continue to be supported during version 6. Here's the list of the outstanding changes you need to take into account when migrating from v5 to v6:

### Self-hosted enterprise customers are now required to use a License Key

Before upgrading you should make sure to get a valid license key. More information in [this page](../deploy/license-keys.mdx).

- For Unleash hosted (Pro/Enterprise), license management is not necessary and is handled automatically.
- For Unleash Open Source, no license is necessary and these steps do not apply.

### Remove Passport libs from the official open source Docker distribution

*If you're not using the official open source image, you can safely ignore this change.* 

The [official open source Docker image](https://hub.docker.com/r/unleashorg/unleash-server) no longer includes these custom authentication libraries. If you're using this feature, there is a [community image](https://github.com/Unleash/unleash-docker-community) that contains (and will continue to contain) these dependencies. 

### Drop support for PostgreSQL versions 10, 11 and 12

*If you're using PostgreSQL 13 or above you can safely ignore this change.*

Unleash v6 will output an error message when starting with an unsupported version but continue to run. We recommend upgrading to a supported version as soon as possible.

### Update to Node.js version 20+

Unleash v6 drops support for Node.js versions below 20, which is the [active LTS at the time of release](https://github.com/nodejs/Release/blob/6209d04302e62156b964a605f619283582334c95/README.md#release-schedule).

### Remove /edge/metrics endpoint

*If you're not using Unleash Edge, you can safely ignore this change.*

If you're using Unleash Edge to connect to Unleash, make sure to first upgrade Unleash Edge to version 19.1.3 or above. If you're using an older version of Edge, the core feature flag functionality will still work, but you will not be able to gather any metrics.

### Remove legacy `/api/feature` endpoint

If you're still using this endpoint, check out the [deprecation notice in v4](#4-legacy-v2-routes-removed).

### Remove deprecated [import service](../../how-to/how-to-import-export)

Unleash v6 drops support for file based import at startup. If you're using this functionality, please check out the issue about adding this functionality to the current import service ([#7128](https://github.com/Unleash/unleash/issues/7128)).

If you're using that endpoint for a custom integration, you should migrate to the [new import service](../../how-to/how-to-environment-import-export) ([new import/export api docs](../../reference/api/unleash/import-export)). 
For a comparison between the two, refer to the [environment import/export vs instance import/export](../../how-to/how-to-environment-import-export#environment-importexport-vs-the-instance-importexport-api) section at the bottom of this page.

### Deprecate custom strategies

Using custom strategies has the drawback of requiring you to distribute the strategy's code with the Unleash client SDK. In contrast, [strategy constraints](../../reference/strategy-constraints) function without needing additional code or maintenance. In most cases, [strategy constraints](../../reference/strategy-constraints) offer sufficient control you need without added complexity. 

If you can't accomplish the same functionality with strategy constraints, please let us know about your use case on [Slack](https://slack.unleash.run/).

### Dropping Internet Explorer (IE) Support

With Unleash v6, Internet Explorer is no longer supported. React v18, used in Unleash, has dropped support for IE, aligning with Microsoft's end of support for IE on June 15, 2022. Users are encouraged to switch to modern browsers for the best experience.

## Upgrading to 5.7 and later from versions < 5.6.11

When running on high-availability (multiple Unleash instances), upgrading from versions lower than 5.6.11 to version 5.7 or higher will cause a temporary UI unavailability while old versions and new versions are both serving traffic, due to a compatibility issue. If you can afford having a small period of time with the UI unavailable (note the SDKs will not be affected), then  you can safely upgrade.

If you rather want to avoid that, you should first update to 5.6.11 and ensure all your Unleash instances are running 5.6.11 before upgrading to 5.7 or later. Any Unleash instances left on earlier versions after the backing database has been updated will continue to work, but you will not be able to log in to them, but the SDKs will continue working fine.

Once you have upgraded to version 5.7 and above, you can no longer downgrade to versions before 5.7 without manual changes to the database.

## Upgrading directly from v3.x to v5.x

<VideoContent videoUrls={["https://www.youtube.com/embed/qmusq_9mE2E"]}/>

Ivar Østhus, Unleash CTO and Co-Founder, demonstrates how to update Unleash 3.x to Unleash 5.x in just a few minutes with no downtime. You can also [watch this on YouTube with a transcript](https://www.youtube.com/watch?v=qmusq_9mE2E&cc_load_policy=1).

##  Upgrading from v4.x to v5.x {#upgrading-from-v4x-to-v5x}

Unleash v5 was released on April 27th, 2023. It contains a few breaking changes.

### Requires Node.js version 18+

Unleash v5 drops support Node.js versions below 18, which is the current active LTS at the time of release. Unleash v4 officially supported Node.js v14 and v16, but both of these will reach end of life in 2023.

### The Google Authenticator provider for SSO has been removed

The Google Authenticator provider is now hidden by default. We recommend using [OpenID Connect](../../how-to/how-to-add-sso-open-id-connect.md) instead.

However, if you are running a self hosted version of Unleash and you need to temporarily re-enable Google SSO, you can do so by setting the `GOOGLE_AUTH_ENABLED` environment variable to `true`. If you're running a hosted version of Unleash, you'll need to reach out to us and ask us to re-enable the flag. However, the ability to do this will be removed in a future release and this is not safe to depend on.

This provider was deprecated in v4.

### Default database password

The Unleash default database password is now `password` instead of `passord`. Turns out that the Norwegian word for password is too similar to the English word, and that people would think it was a typo.

This should only impact dev builds and initial setup. You should never use the default password in any production environments.

### The /api/admin/features API is gone

Most of the old features API was deprecated in v4.3 and superseded by the project API instead. In v5, the deprecated parts have been completely removed. The only operations on that API that are still active are the operations to add or remove a tag from a feature flag.

### Error message structure

Some of Unleash's API error messages have changed their structure. Specifically, this applies to error messages generated by our OpenAPI validation layer. However, only their structure has changed (and they now contain more human-friendly messages); the error codes should still be the same.

Previously, they would look like this:

``` json
{
  "error": "Request validation failed",
  "validation": [
    {
      "keyword": "type",
      "dataPath": ".body.parameters",
      "schemaPath": "#/components/schemas/addonCreateUpdateSchema/properties/parameters/type",
      "params": {
        "type": "object"
      },
      "message": "should be object"
    }
  ]
}
```

Now they look like this instead, and are more in line with the rest of Unleash's error messages.

```json
{
  "id": "37a1765f-a5a0-4371-8aa2-341f331579f9",
  "name": "ValidationError",
  "message": "Request validation failed: the payload you provided doesn't conform to the schema. Check the `details` property for a list of errors that we found.",
  "details": [
    {
      "description": "The .parameters property should be object. You sent [].",
      "path": "parameters"
    }
  ]
}
```

As such, if you're relying on the specifics of the error structure for those API errors, you might need to update your handling.

## Upgrading from v3.x to v4.x {#upgrading-from-v3x-to-v4x}

Before you upgrade we strongly recommend that you take a full [database backup](database-backup), to make sure you can downgrade to version 3.

You can also read the highlights of **[what's new in v4](/user_guide/v4-whats-new)**.

### 1. All API calls now require a token. {#1-all-api-calls-now-requires-token}

If you are upgrading from Unleash Open-Source v3 client SDKs did not need to use an API token in order to connect to Unleash-server. Starting from v4 we have back-ported the API token handling for Enterprise in to the Open-Source version. This means that all client SDKs now need to use a client token in order to connect to Unleash.

Read more in the [API token documentation](../../how-to/how-to-create-api-tokens.mdx).

### 2. Configuring Unleash {#2-configuring-unleash}

We have done a lot of changes to the options you can pass in to Unleash. If you are manually configuring Unleash you should have a look on the updated [configuring Unleash documentation](./configuring-unleash.md)

### 3. Role-based Access Control (RBAC) {#3-role-based-access-control-rbac}

We have implemented RBAC in Unleash v4. This has totally changed the permission system in Unleash.

**Required actions:** If you have implemented "custom authentication" for your users you will need to make changes to your integration:

- _extendedPermissions_ option has been removed. You can no longer specify custom permission per-user basis. All "logged_in users" must belong to a "root" role. This can be "Admin", "Editor" or "Viewer". This is taken care of when you create new users via userService.
- All "logged-in users" needs to be defined in Unleash and have a unique ID. This can be achieved by calling "createUser" on "userService".

Code example:

```js
const user = userService.loginUserWithoutPassword(
  'some@getunleash.io',
  false, // autoCreateUser. Set to true if you want to create users on the fly.
);

// The user needs to be set on the current active session
req.session.user = user;
```

- [Read more about Securing Unleash v4](./securing-unleash.md)
- [Read more about RBAC](../../reference/rbac.md)

### 4. Legacy v2 routes removed {#4-legacy-v2-routes-removed}

Only relevant if you use the `enableLegacyRoutes` option.

In v2 you could query feature flags on `/api/features`. This was deprecated in v4 and we introduced two different endpoints (`/api/admin/features` and `/api/client/features`) to be able to optimize performance and security. In v3 you could still enable the legacy routes via the `enableLegacyRoutes` option. This was removed in v4.

### 5. Unleash CLI has been removed {#5-unleash-cli-has-been-removed}

Unleash no longer ships with a binary that allows you to start Unleash directly from the command line. From v4 you need to either use Unleash via docker or programmatically.

Read more in our [getting started documentation](./getting-started.md)
