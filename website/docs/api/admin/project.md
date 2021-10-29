---
id: projects
title: /api/admin/projects
---

> The context feature is only available as part of Unleash Enterprise. In order to access the API programmatically you need to make sure you [obtain an API token](/user_guide/api-token) with admin permissions.

### List projects in Unleash {#list-projects-in-unleash}

`GET https://unleash.host.com/api/admin/projects`

Returns a list of projects in Unleash.

**Example response:**

```json
{
  "version": 1,
  "projects": [
    {
      "id": "default",
      "name": "Default",
      "description": "Default project",
      "createdAt": "2020-12-03T09:47:20.170Z"
    },
    {
      "id": "MyNewProject",
      "name": "MyNewProject",
      "description": "A test project",
      "createdAt": "2020-12-03T09:47:20.170Z"
    },
    {
      "id": "test",
      "name": "Test Project",
      "description": "Collection of test toggles",
      "createdAt": "2020-12-03T09:47:20.170Z"
    }
  ]
}
```

### Create a new project {#create-a-new-project}

`POST https://unleash.host.com/api/admin/projects`

Creates a new project.

**Body**

```json
{
  "id": "someId",
  "name": "Test Project",
  "description": "Some description"
}
```

### Update a projects field {#update-a-projects-field}

`PUT https://unleash.host.com/api/projects/:id`

Updates a project with id=`id`.

**Body**

```json
{
  "id": "someId",
  "name": "Test Project",
  "description": "Some description"
}
```

### Delete a projects field {#delete-a-projects-field}

`DELETE https://unleash.host.com/api/admin/projects/:id`

Deletes the project with id=`id`.
