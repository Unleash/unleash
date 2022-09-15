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
    "secret": "ew395up3o39ncc9oew395up3o39ncc9o",
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
```

### Create a new public signup token {#create-public-singup-token}

`POST https://unleash.host.com/api/admin/tokens`

Creates a public signup token

**Body**

```json
{
  "name": "shared",
  "expiresAt": "2022-09-15T09:09:09.194Z"
}
```

### Add user {#add-user-to-token}

`POST https://unleash.host.com/api/admin/tokens/ew395up3o39ncc9oew395up3o39ncc9o/signup`

Creates a user with _Viewer_ root role and links them to the signup token

**Payload properties**

:::info Requirements

The payload **must** contain **at least one of** the `name` and `email` properties, though which one is up to you. For the user to be able to log in to the system, the user **must** have an email.

:::

| Property name | Required | Description | Example value(s) |
| --- | --- | --- | --- |
| `email` | No | The user's email address. Must be provided if `username` is not provided. | `"user@getunleash.io"` |
| `username` | No | The user's username. Must be provided if `email` is not provided. | `"Baz the Beholder"` |
| `rootRole` | Yes | The role to assign to the user. Can be either the role's ID or its unique name. | `3`, `"Viewer"` |
| `sendEmail` | No | Whether to send a welcome email with a login link to the user or not. Defaults to `true`. | `false` |
| `name` | No | The user's name (**not** the user's _username_). | `"Sam Seawright" ` |

**Body**

```json
{
  "email": "some-email@getunleash.io",
  "username": "Baz the Beholder",
  "rootRole": "Viewer",
  "sendEmail": true
}
```

#### Return values: {#return-values}

`201: Created`

```json
{
  "createdAt": "2021-05-18T10:28:23.067Z",
  "email": "some-email@getunleash.io",
  "emailSent": true,
  "id": 1337,
  "imageUrl": "https://gravatar.com/avatar/222f2ab70c039dda12e3d11acdcebd02?size=42&default=retro",
  "inviteLink": "http://localhost:4242/new-user?token=123",
  "isAPI": false,
  "loginAttempts": 0,
  "name": "Some Name",
  "rootRole": 2,
  "seenAt": null
}
```

### Update public signup token {#update-public-signup-token}

`POST https://unleash.host.com/api/addons/:id`

Updates an addon configuration.

**Body**

```json
{
  "expiresAt": "2022-10-15T09:09:09.194Z"
}
```

### Notes {#notes}

- `name` can not be changed.

### Delete an addon configuration {#delete-public-signup-token}

`DELETE https://unleash.host.com/api/admin/tokens/:token`

Expires the token with secret=`token`.
