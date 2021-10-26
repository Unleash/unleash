---
id: state
title: /api/admin/state
---

> In order to access the admin API endpoints you need to identify yourself. Unless you're using the `none` authentication method, you'll need to [create an ADMIN token](/user_guide/api-token) and add an Authorization header using the token.

### Export Feature Toggles & Strategies {#export-feature-toggles--strategies}

`GET: http://unleash.host.com/api/admin/state/export`

The api endpoint `/api/admin/state/export` will export feature-toggles and strategies as json by default.\
You can customize the export with query parameters:

| Parameter | Default | Description |
| --- | --- | --- |
| format | `json` | Export format, either `json` or `yaml` |
| download | `false` | If the exported data should be downloaded as a file |
| featureToggles | `true` | Include feature-toggles in the exported data |
| strategies | `true` | Include strategies in the exported data |

**Example response:**

`GET /api/admin/state/export?format=yaml&featureToggles=1&strategies=1`

```yaml
version: 1
features:
  - name: Feature.A
    description: lorem ipsum
    enabled: false
    strategies:
      - name: default
        parameters: {}
    variants:
      - name: variant1
        weight: 50
      - name: variant2
        weight: 50
  - name: Feature.B
    description: lorem ipsum
    enabled: true
    strategies:
      - name: ActiveForUserWithId
        parameters:
          userIdList: '123,221,998'
      - name: GradualRolloutRandom
        parameters:
          percentage: '10'
    variants: []
strategies:
  - name: country
    description: Enable feature for certain countries
    parameters:
      - name: countries
        type: list
        description: List of countries
        required: true
```

### Import Feature Toggles & Strategies {#import-feature-toggles--strategies}

`POST: http://unleash.host.com/api/admin/state/import`

You can import feature-toggles and strategies by POSTing to the `/api/admin/state/import` endpoint.\
You can either send the data as JSON in the POST-body or send a `file` parameter with `multipart/form-data` (YAML files are also accepted here).

**Query Paramters**

- **drop** - Use this parameter if you want the database to be cleaned before import (all strategies and features will be removed).
- **keep** - Use this query parameter if you want to keep all exiting feature toggle (and strategy) configurations as is (no override), and only insert missing feature toggles from the data provided.

> You should be careful using the `drop` parameter in production environments.

Success: `202 Accepted`\
Error: `400 Bad Request`

**Example body:**

```json
{
  "version": 1,
  "features": [
    {
      "name": "Feature.A",
      "description": "lorem ipsum",
      "enabled": false,
      "strategies": [
        {
          "name": "default",
          "parameters": {}
        }
      ],
      "variants": [
        {
          "name": "variant1",
          "weight": 50
        },
        {
          "name": "variant2",
          "weight": 50
        }
      ]
    },
    {
      "name": "Feature.B",
      "description": "lorem ipsum",
      "enabled": true,
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
      "variants": []
    }
  ],
  "strategies": [
    {
      "name": "country",
      "description": "Enable feature for certain countries",
      "parameters": [
        {
          "name": "countries",
          "type": "list",
          "description": "List of countries",
          "required": true
        }
      ]
    }
  ]
}
```
