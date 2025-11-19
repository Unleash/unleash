---
title: /api/client/features
---

import SearchPriority from '@site/src/components/SearchPriority';

<SearchPriority level="noindex" />

> In order to access the client API endpoints you need to identify yourself. Unless you're using the `none` authentication method, you'll need to [create a Backend token](/guides/how-to-create-api-tokens.mdx) and add an Authorization header using the token.

### Fetching Feature Flags {#fetching-feature-toggles}

`GET: http://unleash.host.com/api/client/features`

**HEADERS:**

- UNLEASH-APPNAME: appName
- UNLEASH-INSTANCEID: instanceId

This endpoint is the one all clients should use to fetch all available feature flags from the _unleash-server_. The response returns all active feature flags and their current strategy configuration. A feature flag will have _at least_ one configured strategy. A strategy will have a `name` and `parameters` map.

> _Note:_ Clients should prefer the `strategies` property. Legacy properties (`strategy` & `parameters`) will be kept until **version 2** of the format.

This endpoint should never return anything besides a valid _20X or 304-response_. It will also include an `Etag`-header. The value of this header can be used by clients as the value of the `If-None-Match`-header in the request to prevent a data transfer if the client already has the latest response locally.

**Example response:**

```json
{
  "version": 1,
  "features": [
    {
      "name": "Feature.A",
      "type": "release",
      "enabled": false,
      "stale": false,
      "strategies": [
        {
          "name": "default",
          "parameters": {}
        }
      ],
      "strategy": "default",
      "parameters": {}
    },
    {
      "name": "Feature.B",
      "type": "killswitch",
      "enabled": true,
      "stale": false,
      "strategies": [
        {
          "name": "ActiveForUserWithId",
          "parameters": {
            "userIdList": "123,221,998"
          }
        },
        {
          "name": "GradualRolloutRandom",
          "parameters": {
            "percentage": "10"
          }
        }
      ],
      "strategy": "ActiveForUserWithId",
      "parameters": {
        "userIdList": "123,221,998"
      }
    }
  ]
}
```

#### Filter feature flags {#filter-feature-toggles}

Supports three params for now

- `tag` - filters for features tagged with tag
- `project` - filters for features belonging to project
- `namePrefix` - filters for features beginning with prefix

For `tag` and `project` performs OR filtering if multiple arguments

To filter for any feature tagged with a `simple` tag with value `taga` or a `simple` tag with value `tagb` use

`GET https://unleash.host.com/api/client/features?tag[]=simple:taga&tag[]simple:tagb`

To filter for any feature belonging to project `myproject` use

`GET https://unleash.host.com/api/client/features?project=myproject`

Response format is the same as `api/client/features`

### Get specific feature flag {#get-specific-feature-toggle}

`GET: http://unleash.host.com/api/client/features/:featureName`

Used to fetch details about a specific feature flag. This is mainly provided to make it easy to debug the API and should not be used by the client implementations.

> _Notice_: You will not get a version property when fetching a specific feature flag by name.

```json
{
  "name": "Feature.A",
  "type": "release",
  "enabled": false,
  "stale": false,
  "strategies": [
    {
      "name": "default",
      "parameters": {}
    }
  ],
  "strategy": "default",
  "parameters": {}
}
```

### Strategy Constraints {#strategy-constraints}

:::note Availability

**Version**: `4.16+`

:::

Strategy definitions may also contain a `constraints` property. Strategy constraints is a feature in Unleash which work on context fields, which is defined as part of the [Unleash Context](/reference/unleash-context.md). The purpose is to define a set of rules where all needs to be satisfied in order for the activation strategy to evaluate to true.

**Example response:**

The example shows strategy constraints in action. Constraints is a new field on the strategy-object. It is a list of constraints that need to be satisfied.

In the example `environment` needs to be `production` AND `userId` must be either `123` OR `44` in order for the Unleash Client to evaluate the strategy, which in this scenario is “default” and will always evaluate to true.

```json
{
  "type": "release",
  "enabled": true,
  "stale": false,
  "name": "Demo",
  "strategies": [
    {
      "constraints": [
        {
          "contextName": "environment",
          "operator": "IN",
          "values": ["production"]
        },
        {
          "contextName": "userId",
          "operator": "IN",
          "values": ["123", "44"]
        }
      ],
      "name": "default",
      "parameters": {}
    }
  ]
}
```

- **contextName** - is the name of the field to look up on the unleash context.
- **values** - is a list of values (string).
- **operator** - is the logical action to take on the values Supported operator are:
  - **IN** - constraint is satisfied if one of the values in the list matches the value for this context field in the context.
  - **NOT_IN** - constraint is satisfied if NONE of the values is the list matches the value for this field in the context.

### Variants {#variants}

All feature flags can also take an array of variants. You can read more about [feature flag variants](/reference/feature-toggle-variants).

```json
{
  "version": 1,
  "features": [
    {
      "name": "Demo",
      "type": "operational",
      "enabled": true,
      "stale": false,
      "strategies": [
        {
          "name": "default"
        }
      ],
      "variants": [
        {
          "name": "red",
          "weight": 500,
          "weightType": "variable",
          "payload": {
            "type": "string",
            "value": "something"
          },
          "overrides": [
            {
              "contextName": "userId",
              "values": ["123"]
            }
          ]
        },
        {
          "name": "blue",
          "weight": 500,
          "overrides": [],
          "weightType": "variable"
        }
      ]
    }
  ]
}
```

- **payload** - an optional object representing a payload to the variant. Takes two properties if present `type` and `value`.
- **overrides** - an optional array of overrides. If any context field matches any of the the defined overrides it means that the variant should be selected.
