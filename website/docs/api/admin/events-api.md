---
id: events
title: /api/admin/events
---
import ApiRequest from '@site/src/components/ApiRequest'

:::note
In order to access the admin API endpoints you need to identify yourself. Unless you're using the `none` authentication method, you'll need to [create an ADMIN token](/user_guide/api-token) and add an Authorization header using the token.
:::

The Events API lets you retrieve events from your Unleash instance.

## Event endpoints

### Get all events

<ApiRequest verb="get" url="api/admin/events" title="Retrieve all events from the Unleash instance."/>

#### Query parameters

| Query parameter | Description                                                                | Required |
|-----------------|----------------------------------------------------------------------------|----------|
| `project`       | When applied, the endpoint will only return events from the given project. | No       |

When called without any query parameters, the endpoint will return the **last 100 events** from the Unleash instance.  When called with a `project` query parameter, it will return only events related to that project, but it will return **all the events**, and not just the last 100.


#### Get events by project

<ApiRequest verb="get" url="api/admin/events?project=<project-name>" title="Retrieve all events belonging to the given project."/>

Use the `project` query parameter to make the API return *all* events pertaining to the given project.

#### Responses

<details>
<summary>Responses</summary>

##### 200 OK

The last 100 events from the Unleash server when called without a `project` query parameter.

When called with a `project` query parameter: all events related to that project.

``` json
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

``` json
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

## Event types

Unleash emits a large number of different events (described in more detail in the following sections). The exact fields an event contains varies from event to event, but they all conform to the following TypeScript interface before being transformed to JSON:

```ts

interface IEvent {
    id: number;
    createdAt: Date;
    type: string;
    createdBy: string;
    project?: string;
    environment?: string;
    featureName?: string;
    data?: any;
    preData?: any;
    tags?: ITag[];
}
```

The event properties are described in short in the table below. For more info regarding specific event types, refer to the corresponding, following sections.

| Property      | Description                                                                                           |
|---------------|-------------------------------------------------------------------------------------------------------|
| `id`          | The ID of the event. An increasing natural number.                                                    |
| `createdAt`   | The time the event happened as a RFC 3339-conformant timestamp.                                       |
| `type`        | The event type, as described in the rest of this section.                                             |
| `project`     | The project the event relates to, if applicable.                                                      |
| `environment` | The feature toggle environment the event relates to, if applicable.                                   |
| `featureName` | The name of the feature toggle the event relates to, if applicable.                                   |
| `data`        | Any extra associated data related to the event, such as feature toggle state, if applicable.          |
| `preData`     | For events with new state in the `data` property, the `preData` property contains the previous state. |
| `tags`        | Any tags related to the event, if applicable.                                                         |


### Feature Toggle events:

- feature-created
- feature-deleted
- feature-updated
- feature-metadata-updated
- feature-project-change
- feature-archived
- feature-revived
- feature-import
- feature-tagged
- feature-tag-import
- feature-strategy-update
- feature-strategy-add
- feature-strategy-remove
- drop-feature-tags
- feature-untagged
- feature-stale-on
- feature-stale-off
- drop-features
- feature-environment-enabled
- feature-environment-disabled

### Strategy Events

- strategy-created
- strategy-deleted
- strategy-deprecated
- strategy-reactivated
- strategy-updated
- strategy-import
- drop-strategies

### Context field events

- context-field-created
- context-field-updated
- context-field-deleted

### Project events

- project-created
- project-updated
- project-deleted
- project-import
- drop-projects

### Tag events

- tag-created
- tag-deleted
- tag-import
- drop-tags


### Tag type events

- tag-type-created
- tag-type-deleted
- tag-type-updated
- tag-type-import
- drop-tag-types


### Addon events

- addon-config-created
- addon-config-updated
- addon-config-deleted


### User events

- user-created
- user-updated
- user-deleted


### Environment events (Enterprise)

- drop-environments
- environment-import

**Response**

```json
{
	"version": 2,
	"events": [{
		"id": 187,
		"type": "feature-metadata-updated",
		"createdBy": "admin",
		"createdAt": "2021-11-11T09:42:14.271Z",
		"data": {
			"name": "HelloEvents!",
			"description": "Hello Events update!",
			"type": "release",
			"project": "default",
			"stale": false,
			"variants": [],
			"createdAt": "2021-11-11T09:40:51.077Z",
			"lastSeenAt": null
		},
		"preData": {
			"name": "HelloEvents!",
			"description": "Hello Events!",
			"type": "release",
			"project": "default",
			"stale": false,
			"variants": [],
			"createdAt": "2021-11-11T09:40:51.077Z",
			"lastSeenAt": null
		},
		"tags": [{
			"value": "team-x",
			"type": "simple"
		}],
		"featureName": "HelloEvents!",
		"project": "default",
		"environment": null
	}, {
		"id": 186,
		"type": "feature-tagged",
		"createdBy": "admin",
		"createdAt": "2021-11-11T09:41:20.464Z",
		"data": {
			"type": "simple",
			"value": "team-x"
		},
		"preData": null,
		"tags": [],
		"featureName": "HelloEvents!",
		"project": null,
		"environment": null
	}, {
		"id": 184,
		"type": "feature-environment-enabled",
		"createdBy": "admin",
		"createdAt": "2021-11-11T09:41:03.782Z",
		"data": null,
		"preData": null,
		"tags": [],
		"featureName": "HelloEvents!",
		"project": "default",
		"environment": "default"
	}, {
		"id": 183,
		"type": "feature-strategy-add",
		"createdBy": "admin",
		"createdAt": "2021-11-11T09:41:00.740Z",
		"data": {
			"id": "88e1df00-1951-452f-a063-6f5e18476f87",
			"name": "flexibleRollout",
			"constraints": [],
			"parameters": {
				"groupId": "HelloEvents!",
				"rollout": 51,
				"stickiness": "default"
			}
		},
		"preData": null,
		"tags": [],
		"featureName": "HelloEvents!",
		"project": "default",
		"environment": "default"
	}, {
		"id": 182,
		"type": "feature-created",
		"createdBy": "admin",
		"createdAt": "2021-11-11T09:40:51.083Z",
		"data": {
			"name": "HelloEvents!",
			"description": "Hello Events!",
			"type": "release",
			"project": "default",
			"stale": false,
			"variants": [],
			"createdAt": "2021-11-11T09:40:51.077Z",
			"lastSeenAt": null
		},
		"preData": null,
		"tags": [],
		"featureName": "HelloEvents!",
		"project": "default",
		"environment": null
	}]
}
```

All events will implement the following interface:

```js

interface IEvent {
    id: number;
    createdAt: Date;
    type: string;
    createdBy: string;
    project?: string;
    environment?: string;
    featureName?: string;
    data?: any;
    preData?: any;
    tags?: ITag[];
}
```
