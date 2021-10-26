---
id: addons
title: /api/admin/addons
---

> In order to access the admin API endpoints you need to identify yourself. Unless you're using the `none` authentication method, you'll need to [create an ADMIN token](/user_guide/api-token) and add an Authorization header using the token.

### List addons and providers {#list-addons-and-providers}

`GET https://unleash.host.com/api/admin/addons`

Returns a list of _configured addons_ and available _addon providers_.

**Example response:**

```json
{
  "addons": [
    {
      "id": 30,
      "provider": "webhook",
      "enabled": true,
      "description": "post updates to slack",
      "parameters": {
        "url": "http://localhost:4242/webhook"
      },
      "events": ["feature-created", "feature-updated"]
    },
    {
      "id": 33,
      "provider": "slack",
      "enabled": true,
      "description": "default",
      "parameters": {
        "defaultChannel": "integration-demo-instance",
        "url": "https://hooks.slack.com/someurl"
      },
      "events": ["feature-created", "feature-updated"]
    }
  ],
  "providers": [
    {
      "name": "webhook",
      "displayName": "Webhook",
      "description": "Webhooks are a simple way to post messages from Unleash to third party services. Unleash make use of normal HTTP POST with a payload you may define yourself.",
      "parameters": [
        {
          "name": "url",
          "displayName": "Webhook URL",
          "type": "url",
          "required": true
        },
        {
          "name": "bodyTemplate",
          "displayName": "Body template",
          "description": "You may format the body using a mustache template. If you don't specify anything, the format will be similar to the /api/admin/events format",
          "type": "textfield",
          "required": false
        }
      ],
      "events": [
        "feature-created",
        "feature-updated",
        "feature-archived",
        "feature-revived"
      ]
    },
    {
      "name": "slack",
      "displayName": "Slack",
      "description": "Integrates Unleash with Slack.",
      "parameters": [
        {
          "name": "url",
          "displayName": "Slack webhook URL",
          "type": "url",
          "required": true
        },
        {
          "name": "defaultChannel",
          "displayName": "Default channel",
          "description": "Default channel to post updates to if not specified in the slack-tag",
          "type": "text",
          "required": true
        }
      ],
      "events": [
        "feature-created",
        "feature-updated",
        "feature-archived",
        "feature-revived"
      ],
      "tags": [
        {
          "name": "slack",
          "description": "Slack tag used by the slack-addon to specify the slack channel.",
          "icon": "S"
        }
      ]
    }
  ]
}
```

### Create a new addon configuration {#create-a-new-addon-configuration}

`POST https://unleash.host.com/api/addons`

Creates an addon configuration for an addon provider.

**Body**

```json
{
  "provider": "webhook",
  "description": "Optional description",
  "enabled": true,
  "parameters": {
    "url": "http://localhost:4242/webhook"
  },
  "events": ["feature-created", "feature-updated"]
}
```

### Notes {#notes}

- `provider` must be a valid addon provider

### Update new addon configuration {#update-new-addon-configuration}

`POST https://unleash.host.com/api/addons/:id`

Updates an addon configuration.

**Body**

```json
{
  "provider": "webhook",
  "description": "Optional updated description",
  "enabled": true,
  "parameters": {
    "url": "http://localhost:4242/webhook"
  },
  "events": ["feature-created", "feature-updated"]
}
```

### Notes {#notes-1}

- `provider` can not be changed.

### Delete an addon configuration {#delete-an-addon-configuration}

`DELETE https://unleash.host.com/api/admin/addons/:id`

Deletes the addon with id=`id`.
