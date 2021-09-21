---
id: feature-toggles-v2
title: /api/admin/projects/:projectId
---

> In order to access the admin API endpoints you need to identify yourself. You'll need to [create an ADMIN token](/user_guide/api-token) and add an Authorization header using the token.


In this document we will guide you on how you can work with feature toggles and their configuration. Please remember the following details:

- All feature toggles exists _inside a project_. 
- A feature toggles exists _across all environments_. 
- A feature toggle can take different configuration, activation strategies, per environment.

TODO: Need to explain the following in a bit more details:
- The _default_ environment


> We will in this guide use [HTTPie](https://httpie.io) commands to show examples on how to interact with the API. 

### Get Project Overview {#fetching-project}

`http://localhost:4242/api/admin/projects/:projectId`

This endpoint will give you an general overview of a project. It will return essential details about a project, in addition it will return all feature toggles and high level environment details per feature toggle.

**Example Query**

`http GET http://localhost:4242/api/admin/projects/default Authorization:$KEY`


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

`http://localhost:4242/api/admin/projects/:projectId/features`

This endpoint will return all feature toggles and high level environment details per feature toggle for a given _projectId_

**Example Query**

`http GET http://localhost:4242/api/admin/projects/default/features Authorization:$KEY`


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

`http://localhost:4242/api/admin/projects/:projectId/features`

This endpoint will accept HTTP POST request to create a new feature toggle for a given _projectId_

**Example Query**

```sh
echo '{"name": "demo2", "description": "A new feature toggle"}' | http POST http://localhost:4242/api/admin/projects/default/features Authorization:$KEY`
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

`http://localhost:4242/api/admin/projects/:projectId/features/:featureName`

This endpoint will return the feature toggles with the defined name and _projectId_. We will also see the list of environments and all activation strategies configured per environment.

**Example Query**

```sh
http GET http://localhost:4242/api/admin/projects/default/features/demo Authorization:$KEY`
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

`http://localhost:4242/api/admin/projects/:projectId/features/:featureName`

This endpoint will accept HTTP PUT request to update the feature toggle metadata.

**Example Query**

```sh
echo '{"name": "demo", "description": "An update feature toggle", "type": "kill-switch"}' | http PUT http://localhost:4242/api/admin/projects/default/features/demo Authorization:$KEY`
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

`http://localhost:4242/api/admin/projects/:projectId/features/:featureName`

This endpoint will accept HTTP PATCH request to update the feature toggle metadata.

**Example Query**

```sh
echo '[{"op": "replace", "path": "/description", "value": "patched desc"}]' | http PATCH http://localhost:4242/api/admin/projects/default/features/demo Authorization:$KEY`
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


### Archive Feature Toggle {#archive-toggle}

`http://localhost:4242/api/admin/projects/:projectId/features/:featureName`

This endpoint will accept HTTP PUT request to update the feature toggle metadata.

**Example Query**

```sh
http DELETE http://localhost:4242/api/admin/projects/default/features/demo Authorization:$KEY`
```


**Example response:**

```sh
HTTP/1.1 202 Accepted
Access-Control-Allow-Origin: *
Connection: keep-alive
Date: Wed, 08 Sep 2021 20:09:21 GMT
Keep-Alive: timeout=60
Transfer-Encoding: chunked

```


### Add strategy to Feature Toggle {#add-strategy}

`http://localhost:4242/api/admin/projects/:projectId/features/:featureName/environments/:environment/strategies`

This endpoint will allow you to add a new strategy to a feature toggle in a given environment. 

**Example Query**

```sh
 echo '{"name": "flexibleRollout", "parameters": { "rollout": 20, "groupId": "demo", "stickiness": "default" }}' | \
 http POST http://localhost:4242/api/admin/projects/default/features/demo/environments/production/strategies Authorization:$KEY
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

**Example Query**

```sh
echo '{"name": "flexibleRollout", "parameters": { "rollout": 25, "groupId": "demo","stickiness": "default" }}' | \
http PUT http://localhost:4242/api/admin/projects/default/features/demo/environments/production/strategies/77bbe972-ffce-49b2-94d9-326593e2228e Authorization:$KEY
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

**Example Query**

```sh
echo '[{"op": "replace", "path": "/parameters/rollout", "value": 50}]' | \
http PATCH http://localhost:4242/api/admin/projects/default/features/demo/environments/production/strategies/ea5404e5-0c0d-488c-93b2-0a2200534827 Authorization:$KEY
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

**Example Query**

```sh
http DELETE http://localhost:4242/api/admin/projects/default/features/demo/environments/production/strategies/77bbe972-ffce-49b2-94d9-326593e2228e Authorization:$KEY
```

**Example response:**

```sh
HTTP/1.1 200 OK
Access-Control-Allow-Origin: *
Connection: keep-alive
Content-Type: application/json; charset=utf-8
Date: Tue, 07 Sep 2021 20:47:55 GMT
Keep-Alive: timeout=60
Transfer-Encoding: chunked
Vary: Accept-Encoding
```

### Enable environment for Feature Toggle {#enable-env}

**Example Query**

```sh
http POST http://localhost:4242/api/admin/projects/default/features/demo/environments/development/on Authorization:$KEY --json
```

**Example response:**

```sh
HTTP/1.1 200 OK
Access-Control-Allow-Origin: *
Connection: keep-alive
Date: Tue, 07 Sep 2021 20:49:51 GMT
Keep-Alive: timeout=60
Transfer-Encoding: chunked
```

Possible Errors:

- _409 Conflict_ - You can not enable the environment before it has strategies.