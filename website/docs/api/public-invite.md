---
id: public-invite
title: /invite
---

Public Invite API 

> No credentials needed

### Validate new public signup token {#validate-public-signup-token}

`GET https://unleash.host.com/invite/:token/validate`

Validates a public signup token exists, has not expired and is enabled

#### Return values: {#return-values}

`200: Ok` `400: Bad Request`

### Add user {#add-user-to-token}

`POST https://unleash.host.com/invite/ew395up3o39ncc9oew395up3o39ncc9o/signup`

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

