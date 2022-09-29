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
{
  "tokens": [
    {
      "secret": "ew395up3o39ncc9o",
      "url": "http://localhost:4242/invite-link/ew395up3o39ncc9o/signup",
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
          "imageUrl": "https://gravatar.com/avatar/222f2ab70c039dda12e3d11acdcebd02?size=42&default=retro",
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
        "description": "Allows users to view"
      }
    }
  ]
}
```

### Create a new public signup token {#create-public-signup-token}

`POST https://unleash.host.com/api/admin/tokens`

Creates a public signup token

**Body**

```json
{
  "name": "shared",
  "expiresAt": "2022-09-15T09:09:09.194Z",
}
```

#### Return values: {#return-values}

`200: Ok`

```json
{
  "secret": "ew395up3o39ncc9o",
  "url": "http://localhost:4242/invite-link/ew395up3o39ncc9o/signup",
  "name": "shared",
  "expiresAt": "2022-09-15T09:09:09.194Z",
  "createdAt": "2022-08-15T09:09:09.194Z",
  "createdBy": "Jack Doe",
  "enabled": true,
  "users": [
    {
      "id": 0,
      "isAPI": true,
      "name": "John Doe",
      "email": "john@example.com",
      "username": "BigJ",
      "imageUrl": "https://gravatar.com/avatar/222f2ab70c039dda12e3d11acdcebd02?size=42&default=retro",
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
    "name": "Viewer"
  }
}
```

#### Return values: {#return-values}

`201: Created`

```json
{
  "secret": "ew395up3o39ncc9o",
  "url": "http://localhost:4242/invite-link/ew395up3o39ncc9o/signup",
  "name": "shared",
  "expiresAt": "2022-09-15T09:09:09.194Z",
  "createdAt": "2022-08-15T09:09:09.194Z",
  "createdBy": "Jack Doe",
  "enabled": true,
  "users": [],
  "role": {
    "id": 0,
    "name": "Viewer",
  }
}
```

### Update public signup token {#update-public-signup-token}

`PUT https://unleash.host.com/api/invite-link/tokens/:token`

Updates a  public signup token.

**Body**

```json
{
  "expiresAt": "2022-10-15T09:09:09.194Z",
  "enabled": true
}
```

### Get a public signup token {#delete-public-signup-token}

`Get https://unleash.host.com/api/admin/invite-lint/tokens/:token`

Gets the token with secret=`token`.

### Delete a public signup token {#delete-public-signup-token}

`DELETE https://unleash.host.com/api/admin/invite-lint/tokens/:token`

Deletes the token with secret=`token`.

