---
id: public-signup
title: /api/admin/invite-links
---

> In order to access the admin API endpoints you need to identify yourself. Unless you're using the `none` authentication method, you'll need to [create an ADMIN token](/user_guide/api-token) and add an Authorization header using the token.

### List all public signup tokens

`GET https://unleash.host.com/api/admin/invite-link/tokens`

Returns a list of _public signup tokens_

**Example response:**

```json
[
  {
    "secret": "ew395up3o39ncc9oqr",
    "name": "shared",
    "expiresAt": "2022-09-15T09:09:09.194Z",
    "createdAt": "2022-08-15T09:09:09.194Z",
    "createdBy": "Jack Doe",
    "users": [
      {
        "id": 0,
        "isAPI": true,
        "name": "John Doe",
        "email": "john@example.com",
        "username": "BigJ",
        "imageUrl": "https://image.com/0",
        "inviteLink": "",
        "loginAttempts": 0,
        "emailSent": true,
        "rootRole": 0,
        "seenAt": "2022-09-15T09:09:09.194Z",
        "createdAt": "2022-09-15T09:09:09.194Z"
      }
    ],
    "role": {
      "id": 0,
      "type": "root",
      "name": "Viewer",
      "description": "Allows users to read"
    }
  }
]
```

### Create a new public signup token {#crea}

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
