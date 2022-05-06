---
id: feature-toggles-v2
title: /api/admin/projects/:projectId
---
import ApiRequest from '@site/src/components/ApiRequest'

:::info
In order to access the admin API endpoints you need to identify yourself. Unless you're using the `none` authentication method, you'll need to [create an **admin** token](/user_guide/api-token) and add an Authorization header using the token.
:::


## Fetching Feature Toggles {#fetching-feature-toggles}


**Available since Unleash v4.3**

In this document we will guide you on how you can work with feature toggles and their configuration. Please remember the following details:

- All feature toggles exists _inside a project_.
- A feature toggle exists _across all environments_.
- A feature toggle can take different configuration, activation strategies, per environment.


:::note
This document lists HTTP request data and [cURL](https://curl.se/) and [HTTPie](https://httpie.io) command examples for all endpoints. Further examples use HTTPie.
:::

### Get Project Overview {#fetching-project}


<ApiRequest verb="get" url="api/admin/projects/:project-id" title="Get a project overview"/>

This endpoint will give you an general overview of a project. It will return essential details about a project, in addition it will return all feature toggles and high level environment details per feature toggle.

**Example Query**

```bash
http GET http://localhost:4242/api/admin/projects/default Authorization:$KEY
```



**Example response:**

```json
{
  "description": "Default project",
  "features": [
    {
      "createdAt": "2021-08-31T08:00:33.335Z",
      "environments": [
        {
          "displayName": "Development",
          "enabled": false,
          "name": "development"
        },
        {
          "displayName": "Production",
          "enabled": false,
          "name": "production"
        }
      ],
      "lastSeenAt": null,
      "name": "demo",
      "stale": false,
      "type": "release"
    },
    {
      "createdAt": "2021-08-31T09:43:13.686Z",
      "environments": [
        {
          "displayName": "Development",
          "enabled": false,
          "name": "development"
        },
        {
          "displayName": "Production",
          "enabled": false,
          "name": "production"
        }
      ],
      "lastSeenAt": null,
      "name": "demo.test",
      "stale": false,
      "type": "release"
    }
  ],
  "health": 100,
  "members": 2,
  "name": "Default",
  "version": 1
}
```

From the results we can see that we have received two feature toggles, _demo_, _demo.test_, and other useful metadata about the project.


### Get All Feature Toggles {#fetching-toggles}


<ApiRequest verb="get" url="api/admin/projects/:projectId/features" title="Get all feature toggles in a project"/>

This endpoint will return all feature toggles and high level environment details per feature toggle for a given _projectId_

**Example Query**

``` bash
http GET http://localhost:4242/api/admin/projects/default/features \
Authorization:$KEY
```



**Example response:**

```json
{
  "features": [
    {
      "createdAt": "2021-08-31T08:00:33.335Z",
      "environments": [
        {
          "displayName": "Development",
          "enabled": false,
          "name": "development"
        },
        {
          "displayName": "Production",
          "enabled": false,
          "name": "production"
        }
      ],
      "lastSeenAt": null,
      "name": "demo",
      "stale": false,
      "type": "release"
    },
    {
      "createdAt": "2021-08-31T09:43:13.686Z",
      "environments": [
        {
          "displayName": "Development",
          "enabled": false,
          "name": "development"
        },
        {
          "displayName": "Production",
          "enabled": false,
          "name": "production"
        }
      ],
      "lastSeenAt": null,
      "name": "demo.test",
      "stale": false,
      "type": "release"
    }
  ],
  "version": 1
}
```
### Create Feature Toggle {#create-toggle}

<ApiRequest verb="post" url="api/admin/projects/:projectId/features" title="Create a feature toggle with the specified details (example data)" payload={{ name: "my-feature-toggle" }}/>

This endpoint will accept HTTP POST request to create a new feature toggle for a given _projectId_

**Toggle options**

This endpoint accepts the following toggle options:

| Property name    | Required | Description                                                                                                  | Example value           |
|------------------|----------|--------------------------------------------------------------------------------------------------------------|-------------------------|
| `name`           | Yes      | The name of the feature toggle.                                                                              | `"my-feature-toggle"`   |
| `description`    | No       | The feature toggle's description. Defaults to an empty string.                                               | `"Turn my feature on!"` |
| `impressionData` | No       | Whether to enable [impression data](../../advanced/impression-data.md) for this toggle. Defaults to `false.` | `true`                  |
| `type`           | No       | The [type of toggle](../../advanced/feature-toggle-types.md) you want to create. Defaults to `"release"`     | `"release"`             |


**Example Query**

```bash
echo '{"name": "demo2", "description": "A new feature toggle"}' | \
http POST http://localhost:4242/api/admin/projects/default/features \
Authorization:$KEY`
```


**Example response:**

```json
HTTP/1.1 201 Created
Access-Control-Allow-Origin: *
Connection: keep-alive
Content-Length: 159
Content-Type: application/json; charset=utf-8
Date: Tue, 07 Sep 2021 20:16:02 GMT
ETag: W/"9f-4btEokgk0N74zuBVKKxws0IBu4w"
Keep-Alive: timeout=60
Vary: Accept-Encoding

{
    "createdAt": "2021-09-07T20:16:02.614Z",
    "description": "A new feature toggle",
    "lastSeenAt": null,
    "name": "demo2",
    "project": "default",
    "stale": false,
    "type": "release",
    "variants": null
}
```

Possible Errors:

- _409 Conflict_ - A toggle with that name already exists



### Get Feature Toggle {#get-toggle}

<ApiRequest verb="get" url="api/admin/projects/:projectId/features/:featureName" title="Retrieve a named feature toggle"/>

This endpoint will return the feature toggles with the defined name and _projectId_. We will also see the list of environments and all activation strategies configured per environment.

**Example Query**

```bash
http GET http://localhost:4242/api/admin/projects/default/features/demo \
Authorization:$KEY`
```

**Example response:**

```json
{
    "archived": false,
    "createdAt": "2021-08-31T08:00:33.335Z",
    "description": null,
    "environments": [
        {
            "enabled": false,
            "name": "development",
            "strategies": [
                {
                    "constraints": [],
                    "id": "8eaa8abb-0e03-4dbb-a440-f3bf193917ad",
                    "name": "default",
                    "parameters": null
                }
            ]
        },
        {
            "enabled": false,
            "name": "production",
            "strategies": []
        }
    ],
    "lastSeenAt": null,
    "name": "demo",
    "project": "default",
    "stale": false,
    "type": "release",
    "variants": null
}
```

Possible Errors:

- _404 Not Found_ - Could not find feature toggle with the provided name.

### Update Feature Toggle {#update-toggle}

<ApiRequest verb="put" url="api/admin/projects/:projectId/features/:featureName" title="Update a feature toggle entry (example data)" payload={{ name: "demo", description: "An updated feature toggle description." }}/>

This endpoint will accept HTTP PUT request to update the feature toggle metadata.

**Example Query**

```bash
echo '{"name": "demo", "description": "An update feature toggle", "type": "kill-switch"}' | \
http PUT http://localhost:4242/api/admin/projects/default/features/demo \
Authorization:$KEY`
```


**Example response:**

```json
{
    "createdAt": "2021-09-07T20:16:02.614Z",
    "description": "An update feature toggle",
    "lastSeenAt": null,
    "name": "demo",
    "project": "default",
    "stale": false,
    "type": "kill-switch",
    "variants": null
}
```

Some fields is not possible to change via this endpoint:

- name
- project
- createdAt
- lastSeen

## Patch Feature Toggle {#patch-toggle}


<ApiRequest verb="patch" url="api/admin/projects/:projectId/features/:featureName" title="Patch a feature toggle (example data)" payload={[{op: "replace", path: "/description", value: "patched description"}]}/>

This endpoint will accept HTTP PATCH request to update the feature toggle metadata.

**Example Query**

```bash
echo '[{"op": "replace", "path": "/description", "value": "patched desc"}]' | \
http PATCH http://localhost:4242/api/admin/projects/default/features/demo \
Authorization:$KEY`
```


**Example response:**

```json
{
    "createdAt": "2021-09-07T20:16:02.614Z",
    "description": "patched desc",
    "lastSeenAt": null,
    "name": "demo",
    "project": "default",
    "stale": false,
    "type": "release",
    "variants": null
}
```

Some fields is not possible to change via this endpoint:

- name
- project
- createdAt
- lastSeen


### Clone Feature Toggle {#clone-toggle}

<ApiRequest verb="post" url="api/admin/projects/:projectId/features/:featureName/clone" title="Clone a feature toggle (example data)" payload={{ name: "newToggleName"}}/>

This endpoint will accept HTTP POST request to clone an existing feature toggle with all strategies and variants.  When cloning a toggle, you **must** provide a new name for it. You can not clone archived feature toggles. The newly created feature toggle will be disabled for all environments.

**Example Query**

```bash
echo '{ "name": "DemoNew" }' | \
http POST http://localhost:4242/api/admin/projects/default/features/Demo/clone \
Authorization:$KEY`
```


**Example response:**

```json
HTTP/1.1 201 Created
Access-Control-Allow-Origin: *
Connection: keep-alive
Content-Length: 260
Content-Type: application/json; charset=utf-8
Date: Wed, 06 Oct 2021 20:04:39 GMT
ETag: W/"104-joC/gdjtJ29jZMxj91lIzR42Pmo"
Keep-Alive: timeout=60
Vary: Accept-Encoding

{
    "createdAt": "2021-09-29T10:22:28.523Z",
    "description": "Some useful description",
    "lastSeenAt": null,
    "name": "DemoNew",
    "project": "default",
    "stale": false,
    "type": "release",
    "variants": [
        {
            "name": "blue",
            "overrides": [],
            "stickiness": "default",
            "weight": 1000,
            "weightType": "variable"
        }
    ]
}

```

Possible Errors:

- _409 Conflict_ - A toggle with that name already exists


### Archive Feature Toggle {#archive-toggle}

<ApiRequest verb="delete" url="api/admin/projects/:projectId/features/:featureName" title="Archive a named feature toggle"/>

This endpoint will accept HTTP DELETE requests to archive a feature toggle.

**Example Query**

```bash
http DELETE http://localhost:4242/api/admin/projects/default/features/demo \
Authorization:$KEY`
```


**Example response:**

```
HTTP/1.1 202 Accepted
Access-Control-Allow-Origin: *
Connection: keep-alive
Date: Wed, 08 Sep 2021 20:09:21 GMT
Keep-Alive: timeout=60
Transfer-Encoding: chunked
```


### Add strategy to Feature Toggle {#add-strategy}

<ApiRequest verb="post" url="api/admin/projects/:projectId/features/:featureName/environments/:environment/strategies" title="Add a new strategy to the named feature toggle in the named environment (example data)" payload={{name: "flexibleRollout",
        parameters: {
            rollout: 20,
            groupId: "demo",
            stickiness: "default"
          }
      }}/>

This endpoint will allow you to add a new strategy to a feature toggle in a given environment.

**Example Query**

```bash
echo '{"name": "flexibleRollout",
        "parameters": {
            "rollout": 20,
            "groupId": "demo",
            "stickiness": "default"
          }
      }' | \
http POST \
http://localhost:4242/api/admin/projects/default/features/demo/environments/production/strategies \
Authorization:$KEY
```

**Example response:**

```json
{
    "constraints": [],
    "id": "77bbe972-ffce-49b2-94d9-326593e2228e",
    "name": "flexibleRollout",
    "parameters": {
        "groupId": "demo",
        "rollout": 20,
        "stickiness": "default"
    }
}
```

### Update strategy configuration {#update-strategy}

<ApiRequest verb="put" url="api/admin/projects/:projectId/features/:featureName/environments/:environment/strategies/:strategy-id" title="Overwrite the specified strategy on the named feature toggle in the named environment (example data)" payload={{name: "flexibleRollout",
        parameters: {
            rollout: 25,
            groupId: "demo",
            stickiness: "default"
          }
      }}/>

**Example Query**

```bash
echo '{"name": "flexibleRollout",
        "parameters": {
          "rollout": 25,
          "groupId": "demo",
          "stickiness": "default"
        }
      }' | \
http PUT \
http://localhost:4242/api/admin/projects/default/features/demo/environments/production/strategies/77bbe972-ffce-49b2-94d9-326593e2228e \
Authorization:$KEY
```

**Example response:**

```json
{
    "constraints": [],
    "id": "77bbe972-ffce-49b2-94d9-326593e2228e",
    "name": "flexibleRollout",
    "parameters": {
        "groupId": "demo",
        "rollout": 20,
        "stickiness": "default"
    }
}
```

## Patch strategy configuration {#patch-strategy}

<ApiRequest verb="patch" url="api/admin/projects/:project-id/features/:featureName/environments/:environment/strategies/:strategyId" title="Patch update a strategy definition (example data)" payload={[{"op": "replace", "path": "/parameters/rollout", "value": 50}]}/>

**Example Query**

```bash
echo '[{"op": "replace", "path": "/parameters/rollout", "value": 50}]' | \
http PATCH \
http://localhost:4242/api/admin/projects/default/features/demo/environments/production/strategies/ea5404e5-0c0d-488c-93b2-0a2200534827 \
Authorization:$KEY
```

**Example response:**

```json
{
    "constraints": [],
    "id": "ea5404e5-0c0d-488c-93b2-0a2200534827",
    "name": "flexibleRollout",
    "parameters": {
        "groupId": "demo",
        "rollout": 50,
        "stickiness": "default"
    }
}
```


### Delete strategy from Feature Toggle {#delete-strategy}

<ApiRequest verb="delete" url="api/admin/projects/:projectId/features/:featureName/environments/:environment/strategies/:strategyId" title="Delete the strategy with the given ID"/>

**Example Query**

```bash
http DELETE http://localhost:4242/api/admin/projects/default/features/demo/environments/production/strategies/77bbe972-ffce-49b2-94d9-326593e2228e Authorization:$KEY
```

**Example response:**

```
HTTP/1.1 200 OK
Access-Control-Allow-Origin: *
Connection: keep-alive
Content-Type: application/json; charset=utf-8
Date: Tue, 07 Sep 2021 20:47:55 GMT
Keep-Alive: timeout=60
Transfer-Encoding: chunked
Vary: Accept-Encoding
```

## Enabling and disabling toggles

### Enable Feature Toggle in an Environment {#enable-env}

<ApiRequest verb="post" url="api/admin/projects/:projectId/features/:featureName/environments/:environment/on" title="Activate the named toggle in the given environment"/>

**Example Query**

```bash
http POST http://localhost:4242/api/admin/projects/default/features/demo/environments/development/on Authorization:$KEY --json
```

**Example response:**

```
HTTP/1.1 200 OK
Access-Control-Allow-Origin: *
Connection: keep-alive
Date: Tue, 07 Sep 2021 20:49:51 GMT
Keep-Alive: timeout=60
Transfer-Encoding: chunked
```

Possible Errors:

- _409 Conflict_ - You can not enable the environment before it has strategies.


###  Disable Feature Toggle in an Environment {#disable-env}

<ApiRequest verb="post" url="api/admin/projects/:projectId/features/:featureName/environments/:environment/off" title="Disable the named toggle in the given environment"/>

**Example Query**

```bash
http POST http://localhost:4242/api/admin/projects/default/features/demo/environments/development/off Authorization:$KEY --json
```

**Example response:**

```
HTTP/1.1 200 OK
Access-Control-Allow-Origin: *
Connection: keep-alive
Date: Tue, 07 Sep 2021 20:49:51 GMT
Keep-Alive: timeout=60
Transfer-Encoding: chunked
```


## Feature Variants

### Put variants for Feature Toggle {#update-variants}

<ApiRequest verb="put" url="api/admin/projects/:projectId/features/:featureName/variants" title="Create (overwrite) variants for a feature toggle (example data)" payload={[
	{
		"name": "variant1",
		"weightType": "fix",
		"weight": 650,
        "payload": {
          "type": "json",
          "value": "{\"key1\": \"value\", \"key2\": 123}"
        },
        "stickiness": "userId",
        "overrides": [ {
          "contextName": "userId",
          "values": ["1", "23"]
        } ]
	},
	{
		"name": "variant2",
		"weightType": "variable",
		"weight": 123
	}
]}/>

This overwrites the current variants for the feature toggle specified in the :featureName parameter.
The backend will validate the input for the following invariants

* If there are variants, there needs to be at least one variant with `weightType: variable`
* The sum of the weights of variants with `weightType: fix` must be below 1000 (< 1000)

The backend will also distribute remaining weight up to 1000 after adding the variants with `weightType: fix` together amongst the variants of `weightType: variable`

**Example Query**
```bash
echo '[
	{
		"name": "variant1",
		"weightType": "fix",
		"weight": 650,
        "payload": {
          "type": "json",
          "value": "{\"key1\": \"value\", \"key2\": 123}"
        },
        "stickiness": "userId",
        "overrides": [{
          "contextName": "userId",
          "values": ["1", "23"]
        }]
	},
	{
		"name": "variant2",
		"weightType": "variable",
		"weight": 123
	}
]' | \
http PUT http://localhost:4242/api/admin/projects/default/features/demo/variants Authorization:$KEY
```

**Example response:**

```bash
HTTP/1.1 200 OK
Access-Control-Allow-Origin: *
Connection: keep-alive
Date: Tue, 23 Nov 2021 08:46:32 GMT
Keep-Alive: timeout=60
Transfer-Encoding: chunked
Content-Type: application/json; charset=utf-8

{
  "version": "1",
  "variants": [
    {
      "name": "variant2",
      "weightType": "variable",
      "weight": 350
    },
    {
      "name": "variant1",
      "weightType": "fix",
      "weight": 650
    }
  ]
}
```

### PATCH variants for a feature toggle

<ApiRequest verb="patch" url="api/admin/projects/:projectId/features/:featureName/variants" title="Patch variants for a feature toggle (example data)" payload={[{"op": "add", "path": "/1", "value": {
  "name": "new-variant",
  "weightType": "fix",
  "weight": 200
}}]}/>

**Example Query**

```bash
echo '[{"op": "add", "path": "/1", "value": {
  "name": "new-variant",
  "weightType": "fix",
  "weight": 200
}}]' | \
http PATCH \
http://localhost:4242/api/admin/projects/default/features/demo/variants \
Authorization:$KEY
```

** Example Response **
```json
{
  "version": "1",
  "variants": [
    {
      "name": "variant2",
      "weightType": "variable",
      "weight": 150
    },
    {
      "name": "new-variant",
      "weightType": "fix",
      "weight": 200
    },
    {
      "name": "variant1",
      "weightType": "fix",
      "weight": 650
    }
  ]
}
```


## Manage project users and roles

You can add and remove users to a project using the `/api/admin/projects/:projectId/users/:userId/roles/:roleId` endpoint. When adding or removing users, you must also provide the ID for the role to give them (when adding) or the ID of the role they currently have (when removing).

### Add a user to a project

<ApiRequest verb="POST" url="api/admin/projects/:projectId/users/:userId/roles/:roleId" title="Add a user to a project (example data)" payload={{ userId: 25, projectId: "myProject", roleId: "1" }}/>

This will add a user to a project and give the user a specified role within that project.

#### URL parameters

| Parameter   | Type    | Description                                                           | Example value     |
|-------------|---------|-----------------------------------------------------------------------|-------------------|
| `userId`    | integer | The ID of the user you want to add to the project.                    | `1`               |
| `projectId` | string  | The id of the project to add the user to.                             | `"MyCoolProject"` |
| `roleId`    | integer | The id of the role you want to assign to the new user in the project. | `7`               |


#### Responses

<details>
<summary>Responses data</summary>

##### 200 OK

The user was added to the project with the specified role. This response has no body.

##### 400 Bad Request

The user already exists in the project and cannot be added again:

``` json
[
  {
    "msg": "User already has access to project=<projectId>"
  }
]
```

</details>

#### Example query

The following query would add the user with ID 42 to the _MyCoolProject_ project and give them the role with ID 13.

```bash
http POST \
http://localhost:4242/api/admin/projects/MyCoolProject/users/42/roles/13 \
Authorization:$KEY
```

### Change a user's role in a project


<ApiRequest verb="PUT" url="api/admin/projects/:projectId/users/:userId/roles/:roleId" title="Update a user's role in a project" payload={{ userId: 25, projectId: "myProject", roleId: "3" }}/>

This will change the user's project role to the role specified by `:roleId`. If the user has not been added to the project, nothing happens.

#### URL parameters

| Parameter   | Type    | Description                                          | Example value     |
|-------------|---------|------------------------------------------------------|-------------------|
| `userId`    | integer | The ID of the user whose role you want to update.    | `1`               |
| `projectId` | string  | The id of the relevant project.                      | `"MyCoolProject"` |
| `roleId`    | integer | The role ID of the role you wish to assign the user. | `7`               |


#### Responses

<details>
<summary>Responses data</summary>

##### 200 OK

The user's role has been successfully changed. This response has no body.

##### 400 Bad Request

You tried to change the role of the only user with the `owner` role in the project:

``` json
[
  {
    "msg": "A project must have at least one owner."
  }
]
```

</details>

#### Example query

The following query would change the role of the user with ID 42 the role with ID 13 in the _MyCoolProject_ project.
```bash
http PUT \
http://localhost:4242/api/admin/projects/MyCoolProject/users/42/roles/13 \
Authorization:$KEY
```

### Remove a user from a project

<ApiRequest verb="DELETE" url="api/admin/projects/:projectId/users/:userId/roles/:roleId" title="Delete a user from a project"/>

This removes the specified role from the user in the project. Because users can only have one role in a project, this effectively removes the user from the project. The user _must_ have the role indicated by the `:roleId` URL parameter for the request to succeed.

#### URL parameters

| Parameter   | Type    | Description                                                           | Example value     |
|-------------|---------|-----------------------------------------------------------------------|-------------------|
| `userId`    | integer | The ID of the user you want to remove from the project.               | `1`               |
| `projectId` | string  | The id of the project to remove the user from.                        | `"MyCoolProject"` |
| `roleId`    | integer | The current role the of the user you want to remove from the project. | `7`               |


#### Responses

<details>
<summary>Responses data</summary>

##### 200 OK

The user no longer has the specified role in the project. If the user had this role prior to this API request, they will have been removed from the project. This response has no body.

##### 400 Bad Request

You tried to remove the only user with the role `owner` in the project:

``` json
[
  {
    "msg": "A project must have at least one owner."
  }
]
```

</details>

#### Example query

The following query would remove the user with ID 42 and role ID 13 from the _MyCoolProject_ project.
```bash
http DELETE \
http://localhost:4242/api/admin/projects/MyCoolProject/users/42/roles/13 \
Authorization:$KEY
```
