---
id: user-admin
title: /api/admin/user-admin
---

> In order to access the admin API endpoints you need to identify yourself. Unless you're using the `none` authentication method, you'll need to [create an ADMIN token](../../user_guide/api-token) and add an Authorization header using the token.

### List all users {#list-all-users}

`GET https://unleash.host.com/api/admin/user-admin`

Will return all users and all available root roles for the Unleash instance.

**Body**

```json
{
  "rootRoles": [
    {
      "description": "Users with the global admin role have superuser access to Unleash and can perform any operation within the unleash platform.",
      "id": 1,
      "name": "Admin",
      "project": null,
      "type": "root"
    },
    {
      "description": "Users with this role have access most features in Unleash, but can not manage users and roles in the global scope. If a user with a global regular role creates a project, they will become a project admin and receive superuser rights within the context of that project.",
      "id": 2,
      "name": "Editor",
      "project": null,
      "type": "root"
    },
    {
      "description": "Users with this role can only read root resources in Unleash. They may be added as collaborator to specific projects.",
      "id": 3,
      "name": "Viewer",
      "project": null,
      "type": "root"
    }
  ],
  "users": [
    {
      "createdAt": "2021-05-14T08:56:34.859Z",
      "email": "random-user@getunleash.ai",
      "id": 3,
      "imageUrl": "https://gravatar.com/avatar/3066e45cf3a09d9a4b51e08a3ac20749?size=42&default=retro",
      "inviteLink": "",
      "isAPI": false,
      "loginAttempts": 0,
      "rootRole": 1,
      "seenAt": null
    },
    {
      "createdAt": "2021-05-14T08:58:07.891Z",
      "email": "random-user2@getunleash.ai",
      "id": 4,
      "imageUrl": "https://gravatar.com/avatar/90047524992cd6ae8f66e249a7630d80?size=42&default=retro",
      "inviteLink": "",
      "isAPI": false,
      "loginAttempts": 0,
      "rootRole": 1,
      "seenAt": null
    }
  ]
}
```

### Search for users {#search-for-users}

You can also search for users via the search API. It will preform a simple search based on name and email matching the given query. Requires minimum 2 characters.

`GET http://localhost:4242/api/admin/user-admin/search?q=iv`

**Body**

```json
[
  {
    "email": "iva2@some-mail.com",
    "id": 19,
    "imageUrl": "https://gravatar.com/avatar/6c795493735ff1864f17d47ec52cf0ec?size=42&default=retro"
  },
  {
    "email": "ivar@another.com",
    "id": 20,
    "imageUrl": "https://gravatar.com/avatar/f4b3e16a54bfbe824eb814479053bf88?size=42&default=retro"
  }
]
```

### Add a new user {#add-a-new-user}

`POST https://unleash.host.com/api/admin/user-admin`

Creates a new use with the given root role.

**Body**

```json
{
  "email": "some-email@getunleash.io",
  "name": "Some Name",
  "rootRole": 2
}
```

**Notes**

- `rootRole` can either be the role id or the unique name of the role (e.g: `Editor`).

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

`400: Bad request`

```json
[
  {
    "msg": "User already exists"
  }
]
```

`400: Bad request`

```json
[
  {
    "msg": "You must specify username or email"
  }
]
```

### Update a user {#update-a-user}

`POST https://unleash.host.com/api/admin/user-admin/:userId`

Updates use with new fields

**Body**

```json
{
  "email": "some-email@getunleash.io",
  "name": "Some Name",
  "rootRole": 2
}
```

**Notes**

- `userId` is required as a url path parameter.
- All fields are optional. Only provided fields are updated.

### Delete a user {#delete-a-user}

`DELETE https://unleash.host.com/api/admin/user-admin/:userId`

Deletes the user with the given `userId`.

Possible return values:

- `200: OK` - user was deleted
- `404: NOT FOUND` - No user with the provided `userId` was found

### Change password for a user {#change-password-for-a-user}

`POST https://unleash.host.com/api/admin/user-admin/:userId/change-password`

**Body**

```json
{
  "password": "k!5As3HquUrQ"
}
```

Return values:

- `200 OK`: Password was changed.
- `400 Bad Request`: Password was not changed. Unleash requires a strong password. Please see in the response body on how to improve the password.

### Validate password for a user {#validate-password-for-a-user}

You can use this endpoint to validate the strength of a given password.

`http POST http://localhost:4242/api/admin/user-admin/validate-password`

**Body**

```json
{
  "password": "some-simple"
}
```

- `200 OK`: Password is strong enough for Unleash.
- `400 Bad Request`: Unleash requires a stronger password. Please see in the response body on how to improve the password.
