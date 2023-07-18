---
title: /api/admin/events
---

import ApiRequest from '@site/src/components/ApiRequest'

:::note

In order to access the admin API endpoints you need to identify yourself. Unless you're using the `none` authentication method, you'll need to [create an ADMIN token](/how-to/how-to-create-api-tokens) and add an Authorization header using the token.

:::

The Events API lets you retrieve [events](/reference/event-types.mdx) from your Unleash instance.

## Event endpoints

### Get all events

<ApiRequest verb="get" url="api/admin/events" title="Retrieve all events from the Unleash instance."/>

#### Query parameters

| Query parameter | Description | Required |
| --- | --- | --- |
| `project` | When applied, the endpoint will only return events from the given project. | No |

When called without any query parameters, the endpoint will return the **last 100 events** from the Unleash instance. When called with a `project` query parameter, it will return only events related to that project, but it will return **all the events**, and not just the last 100.

#### Get events by project

<ApiRequest verb="get" url="api/admin/events?project=<project-name>" title="Retrieve all events belonging to the given project."/>

Use the `project` query parameter to make the API return _all_ events pertaining to the given project.

#### Responses

<details>
<summary>Responses</summary>

##### 200 OK

The last 100 events from the Unleash server when called without a `project` query parameter.

When called with a `project` query parameter: all events related to that project.

```json title="Successful response; a list of events"
{
  "version": 1,
  "events": [
    {
      "id": 842,
      "type": "feature-environment-enabled",
      "createdBy": "user@company.com",
      "createdAt": "2022-05-12T08:49:49.521Z",
      "data": null,
      "preData": null,
      "tags": [],
      "featureName": "my-constrained-toggle",
      "project": "my-project",
      "environment": "development"
    },
    {
      "id": 841,
      "type": "feature-environment-disabled",
      "createdBy": "user@company.com",
      "createdAt": "2022-05-12T08:49:45.986Z",
      "data": null,
      "preData": null,
      "tags": [],
      "featureName": "my-constrained-toggle",
      "project": "my-project",
      "environment": "development"
    }
  ]
}
```

</details>

### Get events for a specific toggle

<ApiRequest verb="get" url="api/admin/events/<toggle-name>" title="Retrieve all events related to the given toggle."/>

Fetch all events related to a specified toggle.

#### Responses

<details>
<summary>Responses</summary>

###### 200 OK

The list of events related to the given toggle.

```json title="Successful response; all events relating to the specified toggle"
{
  "toggleName": "my-constrained-toggle",
  "events": [
    {
      "id": 842,
      "type": "feature-environment-enabled",
      "createdBy": "user@company.com",
      "createdAt": "2022-05-12T08:49:49.521Z",
      "data": null,
      "preData": null,
      "tags": [],
      "featureName": "my-constrained-toggle",
      "project": "my-project",
      "environment": "development"
    },
    {
      "id": 841,
      "type": "feature-environment-disabled",
      "createdBy": "user@company.com",
      "createdAt": "2022-05-12T08:49:45.986Z",
      "data": null,
      "preData": null,
      "tags": [],
      "featureName": "my-constrained-toggle",
      "project": "my-project",
      "environment": "development"
    }
  ]
}
```

</details>

## Event type description


:::note Content moved

This section has been moved to a dedicated [event type reference document](/reference/event-types.mdx).

:::
