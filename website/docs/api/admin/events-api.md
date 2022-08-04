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

Unleash emits a large number of different events (described in more detail in the next sections). The exact fields an event contains varies from event to event, but they all conform to the following TypeScript interface before being transformed to JSON:

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

| Property | Description |
| --- | --- |
| `createdAt` | The time the event happened as a RFC 3339-conformant timestamp. |
| `data` | Extra associated data related to the event, such as feature toggle state, segment configuration, etc., if applicable. |
| `environment` | The feature toggle environment the event relates to, if applicable. |
| `featureName` | The name of the feature toggle the event relates to, if applicable. |
| `id` | The ID of the event. An increasing natural number. |
| `preData` | Data relating to the previous state of the event's subject. |
| `project` | The project the event relates to, if applicable. |
| `tags` | Any tags related to the event, if applicable. |
| `type` | The event type, as described in the rest of this section. |

## Feature toggle events

These events pertain to feature toggles and their life cycle.

### `feature-created`

This event fires when you create a feature. The `data` property contains the details for the new feature.

```json title="example event: feature-created"
{
  "id": 899,
  "type": "feature-created",
  "createdBy": "user@company.com",
  "createdAt": "2022-05-31T13:32:20.560Z",
  "data": {
    "name": "new-feature",
    "description": "Toggle description",
    "type": "release",
    "project": "my-project",
    "stale": false,
    "variants": [],
    "createdAt": "2022-05-31T13:32:20.547Z",
    "lastSeenAt": null,
    "impressionData": true
  },
  "preData": null,
  "tags": [],
  "featureName": "new-feature",
  "project": "my-project",
  "environment": null
}
```

### `feature-updated`

:::caution Deprecation notice

This event type was replaced by more granular event types in Unleash 4.3. From Unleash 4.3 onwards, you'll need to use the events listed later in this section instead.

:::

This event fires when a feature gets updated in some way. The `data` property contains the new state of the toggle. This is a legacy event, so it does not populate `preData` property.

```json title="example event: feature-updated"
{
  "id": 899,
  "type": "feature-updated",
  "createdBy": "user@company.com",
  "createdAt": "2022-05-31T13:32:20.560Z",
  "data": {
    "name": "new-feature",
    "description": "Toggle description",
    "type": "release",
    "project": "my-project",
    "stale": false,
    "variants": [],
    "createdAt": "2022-05-31T13:32:20.547Z",
    "lastSeenAt": null,
    "impressionData": true
  },
  "preData": null,
  "tags": [],
  "featureName": "new-feature",
  "project": "my-project",
  "environment": null
}
```

### `feature-deleted`

This event fires when you delete a feature toggle. The `preData` property contains the deleted toggle data.

```json title="example event: feature-deleted"
{
  "id": 903,
  "type": "feature-deleted",
  "createdBy": "admin-account",
  "createdAt": "2022-05-31T14:06:14.574Z",
  "data": null,
  "preData": {
    "name": "new-feature",
    "type": "experiment",
    "stale": false,
    "project": "my-project",
    "variants": [],
    "createdAt": "2022-05-31T13:32:20.547Z",
    "lastSeenAt": null,
    "description": "Toggle description",
    "impressionData": true
  },
  "tags": [],
  "featureName": "new-feature",
  "project": "my-project",
  "environment": null
}
```

### `feature-archived`

This event fires when you archive a toggle.

```json title="example event: feature-archived"
{
  "id": 902,
  "type": "feature-archived",
  "createdBy": "user@company.com",
  "createdAt": "2022-05-31T14:04:38.661Z",
  "data": null,
  "preData": null,
  "tags": [],
  "featureName": "new-feature",
  "project": "my-project",
  "environment": null
}
```

### `feature-revived`

This event fires when you revive an archived feature toggle (when you take a toggle out from the archive).

```json title="example-event: feature-revived"
{
  "id": 914,
  "type": "feature-revived",
  "createdBy": "user@company.com",
  "createdAt": "2022-06-01T09:57:10.719Z",
  "data": null,
  "preData": null,
  "tags": [],
  "featureName": "new-feature",
  "project": "my-other-project",
  "environment": null
}
```

### `feature-metadata-updated`

This event fires when a feature's metadata (its description, toggle type, or impression data settings) are changed. The `data` property contains the new toggle data. The `preData` property contains the toggle's previous data.

The below example changes the toggle's type from _release_ to _experiment_.

```json title="example event: feature-metadata-updated"
{
  "id": 901,
  "type": "feature-metadata-updated",
  "createdBy": "user@company.com",
  "createdAt": "2022-05-31T13:35:25.244Z",
  "data": {
    "name": "new-feature",
    "description": "Toggle description",
    "type": "experiment",
    "project": "my-project",
    "stale": false,
    "variants": [],
    "createdAt": "2022-05-31T13:32:20.547Z",
    "lastSeenAt": null,
    "impressionData": true
  },
  "preData": {
    "name": "new-feature",
    "type": "release",
    "stale": false,
    "project": "my-project",
    "variants": [],
    "createdAt": "2022-05-31T13:32:20.547Z",
    "lastSeenAt": null,
    "description": "Toggle description",
    "impressionData": true
  },
  "tags": [],
  "featureName": "new-feature",
  "project": "my-project",
  "environment": null
}
```

### `feature-project-change`

This event fires when you move a feature from one project to another. The `data` property contains the names of the old and the new project.

```json title="example event: feature-project-change"
{
  "id": 11,
  "type": "feature-project-change",
  "createdBy": "admin",
  "createdAt": "2022-06-03T11:09:41.444Z",
  "data": {
    "newProject": "default",
    "oldProject": "2"
  },
  "preData": null,
  "tags": [],
  "featureName": "feature",
  "project": "default",
  "environment": null
}
```

### `feature-import`

This event fires when you import a feature as part of an import process. The `data` property contains the feature data.

```json title="example event: feature-import"
{
  "id": 26,
  "type": "feature-import",
  "createdBy": "import-API-token",
  "createdAt": "2022-06-03T11:30:40.570Z",
  "data": {
    "name": "feature",
    "description": "",
    "type": "release",
    "project": "default",
    "stale": false,
    "variants": [],
    "impressionData": false,
    "enabled": false,
    "archived": false
  },
  "preData": null,
  "tags": [],
  "featureName": null,
  "project": null,
  "environment": null
}
```

### `feature-tagged`

This event fires when you add a tag to a feature. The `data` property contains the new tag.

```json title="example event: feature-tagged"
{
  "id": 897,
  "type": "feature-tagged",
  "createdBy": "user@company.com",
  "createdAt": "2022-05-31T13:06:31.047Z",
  "data": {
    "type": "simple",
    "value": "tag2"
  },
  "preData": null,
  "tags": [],
  "featureName": "example-feature-name",
  "project": null,
  "environment": null
}
```

### `feature-untagged`

This event fires when you remove a tag from a toggle. The `data` property contains the tag that was removed.

```json title="example event: feature-untagged"
{
  "id": 893,
  "type": "feature-untagged",
  "createdBy": "user@company.com",
  "createdAt": "2022-05-31T12:58:10.241Z",
  "data": {
    "type": "simple",
    "value": "thisisatag"
  },
  "preData": null,
  "tags": [],
  "featureName": "example-feature-name",
  "project": null,
  "environment": null
}
```

### `feature-tag-import`

This event fires when you import a tagged feature as part of an import job. The `data` property contains the name of the feature and the tag.

```json title="example event: feature-tag-import"
{
  "id": 43,
  "type": "feature-tag-import",
  "createdBy": "import-API-token",
  "createdAt": "2022-06-03T11:30:40.606Z",
  "data": {
    "featureName": "new-feature",
    "tag": {
      "type": "simple",
      "value": "tag1"
    }
  },
  "preData": null,
  "tags": [],
  "featureName": null,
  "project": null,
  "environment": null
}
```

### `feature-strategy-add`

This event fires when you add a strategy to a feature. The `data` property contains the configuration for the new strategy.

```json title="example event: feature-strategy-add"
{
  "id": 919,
  "type": "feature-strategy-add",
  "createdBy": "user@company.com",
  "createdAt": "2022-06-01T10:03:08.290Z",
  "data": {
    "id": "3f4bf713-696c-43a4-8ce7-d6c607108858",
    "name": "flexibleRollout",
    "constraints": [],
    "parameters": {
      "groupId": "new-feature",
      "rollout": "67",
      "stickiness": "default"
    }
  },
  "preData": null,
  "tags": [],
  "featureName": "new-feature",
  "project": "my-other-project",
  "environment": "default"
}
```

### `feature-strategy-update`

This event fires when you update a feature strategy. The `data` property contains the new strategy configuration. The `preData` property contains the previous strategy configuration.

```json title="example event: feature-strategy-update"
{
  "id": 920,
  "type": "feature-strategy-update",
  "createdBy": "user@company.com",
  "createdAt": "2022-06-01T10:03:11.549Z",
  "data": {
    "id": "3f4bf713-696c-43a4-8ce7-d6c607108858",
    "name": "flexibleRollout",
    "constraints": [],
    "parameters": {
      "groupId": "new-feature",
      "rollout": "32",
      "stickiness": "default"
    }
  },
  "preData": {
    "id": "3f4bf713-696c-43a4-8ce7-d6c607108858",
    "name": "flexibleRollout",
    "parameters": {
      "groupId": "new-feature",
      "rollout": "67",
      "stickiness": "default"
    },
    "constraints": []
  },
  "tags": [],
  "featureName": "new-feature",
  "project": "my-other-project",
  "environment": "default"
}
```

### `feature-strategy-remove`

This event fires when you remove a strategy from a feature. The `preData` contains the configuration of the strategy that was removed.

```json title="example event: feature-strategy-remove"
{
  "id": 918,
  "type": "feature-strategy-remove",
  "createdBy": "user@company.com",
  "createdAt": "2022-06-01T10:03:00.229Z",
  "data": null,
  "preData": {
    "id": "9591090e-acb0-4088-8958-21faaeb7147d",
    "name": "default",
    "parameters": {},
    "constraints": []
  },
  "tags": [],
  "featureName": "new-feature",
  "project": "my-other-project",
  "environment": "default"
}
```

### `feature-stale-on`

This event fires when you mark a feature as stale.

```json title="example event: feature-stale-on"
{
  "id": 926,
  "type": "feature-stale-on",
  "createdBy": "user@company.com",
  "createdAt": "2022-06-01T10:10:46.737Z",
  "data": null,
  "preData": null,
  "tags": [
    {
      "value": "tag",
      "type": "simple"
    },
    {
      "value": "tog",
      "type": "simple"
    }
  ],
  "featureName": "new-feature",
  "project": "my-other-project",
  "environment": null
}
```

### `feature-stale-off`

This event fires when you mark a stale feature as no longer being stale.

```json title="example event: feature-stale-off"
{
  "id": 928,
  "type": "feature-stale-off",
  "createdBy": "user@company.com",
  "createdAt": "2022-06-01T10:10:52.790Z",
  "data": null,
  "preData": null,
  "tags": [
    {
      "value": "tag",
      "type": "simple"
    },
    {
      "value": "tog",
      "type": "simple"
    }
  ],
  "featureName": "new-feature",
  "project": "my-other-project",
  "environment": null
}
```

### `feature-environment-enabled`

This event fires when you enable an environment for a feature. The `environment` property contains the name of the environment.

```json title="example event: feature-environment-enabled"
{
  "id": 930,
  "type": "feature-environment-enabled",
  "createdBy": "user@company.com",
  "createdAt": "2022-06-02T12:09:03.045Z",
  "data": null,
  "preData": null,
  "tags": [
    {
      "value": "tag",
      "type": "simple"
    },
    {
      "value": "tog",
      "type": "simple"
    }
  ],
  "featureName": "new-feature",
  "project": "my-other-project",
  "environment": "development"
}
```

### `feature-environment-disabled`

This event fires when you disable an environment for a feature. The `environment` property contains the name of the environment.

```json title="example event: feature-environment-disabled"
{
  "id": 931,
  "type": "feature-environment-disabled",
  "createdBy": "user@company.com",
  "createdAt": "2022-06-02T12:09:04.469Z",
  "data": null,
  "preData": null,
  "tags": [
    {
      "value": "tag",
      "type": "simple"
    },
    {
      "value": "tog",
      "type": "simple"
    }
  ],
  "featureName": "new-feature",
  "project": "my-other-project",
  "environment": "development"
}
```

### `drop-features`

This event fires when you delete existing features as part of an import job. The `data.name` property will always be `"all-features"`.

```json title="example event: drop-features"
{
  "id": 25,
  "type": "drop-features",
  "createdBy": "import-API-token",
  "createdAt": "2022-06-03T11:30:40.563Z",
  "data": {
    "name": "all-features"
  },
  "preData": null,
  "tags": [],
  "featureName": null,
  "project": null,
  "environment": null
}
```

### `drop-feature-tags`

This event fires when you drop all existing tags as part of a configuration import. The `data.name` property will always be `"all-feature-tags"`.

```json title="example event: drop-feature-tags"
{
  "id": 36,
  "type": "drop-feature-tags",
  "createdBy": "import-API-token",
  "createdAt": "2022-06-03T11:30:40.596Z",
  "data": {
    "name": "all-feature-tags"
  },
  "preData": null,
  "tags": [],
  "featureName": null,
  "project": null,
  "environment": null
}
```

## Strategy events

### `strategy-created`

This event fires when you create a strategy. The `data` property contains the strategy configuration.

```json title="example event: strategy-created"
{
  "id": 932,
  "type": "strategy-created",
  "createdBy": "user@company.com",
  "createdAt": "2022-06-02T12:20:52.111Z",
  "data": {
    "name": "new-strategy",
    "description": "this strategy does ...",
    "parameters": [],
    "editable": true,
    "deprecated": false
  },
  "preData": null,
  "tags": [],
  "featureName": null,
  "project": null,
  "environment": null
}
```

### `strategy-updated`

This event fires when you change a strategy's configuration. The `data` property contains the new strategy configuration.

```json title="example event: strategy-updated"
{
  "id": 933,
  "type": "strategy-updated",
  "createdBy": "user@company.com",
  "createdAt": "2022-06-02T12:21:23.741Z",
  "data": {
    "name": "new-strategy",
    "description": "this strategy does something else!",
    "parameters": [],
    "editable": true,
    "deprecated": false
  },
  "preData": null,
  "tags": [],
  "featureName": null,
  "project": null,
  "environment": null
}
```

### `strategy-deleted`

This event fires when you delete a strategy. The `data` property contains the name of the deleted strategy.

```json title="example event: strategy-deleted"
{
  "id": 936,
  "type": "strategy-deleted",
  "createdBy": "user@company.com",
  "createdAt": "2022-06-02T12:22:01.302Z",
  "data": {
    "name": "new-strategy"
  },
  "preData": null,
  "tags": [],
  "featureName": null,
  "project": null,
  "environment": null
}
```

### `strategy-deprecated`

This event fires when you deprecate a strategy. The `data` property contains the name of the deprecated strategy.

```json title="example event: strategy-deprecated"
{
  "id": 934,
  "type": "strategy-deprecated",
  "createdBy": "user@company.com",
  "createdAt": "2022-06-02T12:21:45.041Z",
  "data": {
    "name": "new-strategy"
  },
  "preData": null,
  "tags": [],
  "featureName": null,
  "project": null,
  "environment": null
}
```

### `strategy-reactivated`

This event fires when you bring reactivate a deprecated strategy. The `data` property contains the name of the reactivated strategy.

```json title="example event: strategy-reactivated"
{
  "id": 935,
  "type": "strategy-reactivated",
  "createdBy": "user@company.com",
  "createdAt": "2022-06-02T12:21:49.010Z",
  "data": {
    "name": "new-strategy"
  },
  "preData": null,
  "tags": [],
  "featureName": null,
  "project": null,
  "environment": null
}
```

### `strategy-import`

This event fires when you import a strategy as part of an import job. The `data` property contains the strategy's configuration.

```json title="example event: strategy-import"
{
  "id": 29,
  "type": "strategy-import",
  "createdBy": "import-API-token",
  "createdAt": "2022-06-03T11:30:40.583Z",
  "data": {
    "name": "gradualRolloutSessionId",
    "description": "Gradually activate feature toggle. Stickiness based on session id.",
    "parameters": [
      {
        "name": "percentage",
        "type": "percentage",
        "description": "",
        "required": false
      },
      {
        "name": "groupId",
        "type": "string",
        "description": "Used to define a activation groups, which allows you to correlate across feature toggles.",
        "required": true
      }
    ],
    "deprecated": true
  },
  "preData": null,
  "tags": [],
  "featureName": null,
  "project": null,
  "environment": null
}
```

### `drop-strategies`

This event fires when you delete existing strategies as part of an important job. The `data.name` property will always be `"all-strategies"`.

```json title="example event: drop-strategies"
{
  "id": 28,
  "type": "drop-strategies",
  "createdBy": "import-API-token",
  "createdAt": "2022-06-03T11:30:40.579Z",
  "data": {
    "name": "all-strategies"
  },
  "preData": null,
  "tags": [],
  "featureName": null,
  "project": null,
  "environment": null
}
```

## Context field events

### `context-field-created`

This event fires when you create a context field. The `data` property contains the context field configuration.

```json title="example event: context-field-created"
{
  "id": 937,
  "type": "context-field-created",
  "createdBy": "user@company.com",
  "createdAt": "2022-06-02T13:17:17.499Z",
  "data": {
    "name": "new-context-field",
    "description": "this context field is for describing events",
    "legalValues": [],
    "stickiness": false
  },
  "preData": null,
  "tags": [],
  "featureName": null,
  "project": null,
  "environment": null
}
```

### `context-field-updated`

This event fires when you update a context field. The `data` property contains the new context field configuration.

```json title="example event: context-field-updated"
{
  "id": 939,
  "type": "context-field-updated",
  "createdBy": "user@company.com",
  "createdAt": "2022-06-02T13:19:19.422Z",
  "data": {
    "name": "new-context-field",
    "description": "this context field is for describing events",
    "legalValues": [
      {
        "value": "0fcf7d07-276c-41e1-a207-e62876d9c949",
        "description": "Red team"
      },
      {
        "value": "176ab647-4d50-41bf-afe0-f8b856d9bbb9",
        "description": "Blue team"
      }
    ],
    "stickiness": false
  },
  "preData": null,
  "tags": [],
  "featureName": null,
  "project": null,
  "environment": null
}
```

### `context-field-deleted`

This event fires when you delete a context field. The `data` property contains the name of the deleted context field.

```json title="example event: context-field-deleted"
{
  "id": 940,
  "type": "context-field-deleted",
  "createdBy": "user@company.com",
  "createdAt": "2022-06-02T13:20:41.386Z",
  "data": {
    "name": "new-context-field"
  },
  "preData": null,
  "tags": [],
  "featureName": null,
  "project": null,
  "environment": null
}
```

## Project events

### `project-created`

This event fires when you create a project. The `data` property contains the project configuration.

```json title="example event: project-created"
{
  "id": 905,
  "type": "project-created",
  "createdBy": "user@company.com",
  "createdAt": "2022-05-31T14:16:14.498Z",
  "data": {
    "id": "my-other-project",
    "name": "my other project",
    "description": "a project for important work"
  },
  "preData": null,
  "tags": [],
  "featureName": null,
  "project": "my-other-project",
  "environment": null
}
```

### `project-updated`

This event fires when you update a project's configuration. The `data` property contains the new project configuration. The `preData` property contains the previous project configuration.

```json title="example event: project-updated"
{
  "id": 941,
  "type": "project-updated",
  "createdBy": "user@company.com",
  "createdAt": "2022-06-02T13:23:55.025Z",
  "data": {
    "id": "my-other-project",
    "name": "my other project",
    "description": "a project for important work!"
  },
  "preData": {
    "id": "my-other-project",
    "name": "my other project",
    "health": 50,
    "createdAt": "2022-05-31T14:16:14.483Z",
    "updatedAt": "2022-06-02T12:30:48.095Z",
    "description": "a project for important work"
  },
  "tags": [],
  "featureName": null,
  "project": "my-other-project",
  "environment": null
}
```

### `project-deleted`

This event fires when you delete a project. The `project` property contains the name of the deleted project.

```json title="example event: project-deleted"
{
  "id": 944,
  "type": "project-deleted",
  "createdBy": "user@company.com",
  "createdAt": "2022-06-02T13:25:53.820Z",
  "data": null,
  "preData": null,
  "tags": [],
  "featureName": null,
  "project": "my-other-project",
  "environment": null
}
```

### `project-import`

This event fires when you import a project. The `data` property contains the project's configuration details.

```json title="example event: project-import"
{
  "id": 35,
  "type": "project-import",
  "createdBy": "import-API-token",
  "createdAt": "2022-06-03T11:30:40.591Z",
  "data": {
    "id": "default",
    "name": "Default",
    "description": "Default project",
    "createdAt": "2022-06-03T09:30:40.587Z",
    "health": 100,
    "updatedAt": "2022-06-03T11:30:40.587Z"
  },
  "preData": null,
  "tags": [],
  "featureName": null,
  "project": null,
  "environment": null
}
```

### `drop-projects`

This event fires when you delete existing projects as part of an import job. The `data.name` property will always be `"all-projects"`.

```json title="example event: drop-projects"
{
  "id": 33,
  "type": "drop-projects",
  "createdBy": "import-API-token",
  "createdAt": "2022-06-03T11:30:40.586Z",
  "data": {
    "name": "all-projects"
  },
  "preData": null,
  "tags": [],
  "featureName": null,
  "project": null,
  "environment": null
}
```

## Tag events

### `tag-created`

This event fires when you create a new tag. The `data` property contains the tag that was created.

```json title="example event: tag-created"
{
  "id": 959,
  "type": "feature-tagged",
  "createdBy": "user@company.com",
  "createdAt": "2022-06-03T10:13:39.401Z",
  "data": {
    "type": "heartag",
    "value": "tag-value"
  },
  "preData": null,
  "tags": [],
  "featureName": "new-feature",
  "project": null,
  "environment": null
}
```

### `tag-deleted`

This event fires when you delete a tag. The `data` property contains the tag that was deleted.

```json title="example event: tag-deleted"
{
  "id": 957,
  "type": "tag-deleted",
  "createdBy": "user@company.com",
  "createdAt": "2022-06-03T10:12:17.310Z",
  "data": {
    "type": "heartag",
    "value": "tag-value"
  },
  "preData": null,
  "tags": [],
  "featureName": null,
  "project": null,
  "environment": null
}
```

### `tag-import`

This event fires when you import a tag as part of an import job. The `data` property contains the imported tag.

```json title="example event: tag-import"
{
  "id": 41,
  "type": "tag-import",
  "createdBy": "import-API-token",
  "createdAt": "2022-06-03T11:30:40.603Z",
  "data": {
    "type": "simple",
    "value": "tag1"
  },
  "preData": null,
  "tags": [],
  "featureName": null,
  "project": null,
  "environment": null
}
```

### `drop-tags`

This event fires when you delete existing tags as part of an import job. The `data.name` property will always be `"all-tags"`.

```json title="example event: drop-tags"
{
  "id": 37,
  "type": "drop-tags",
  "createdBy": "import-API-token",
  "createdAt": "2022-06-03T11:30:40.596Z",
  "data": {
    "name": "all-tags"
  },
  "preData": null,
  "tags": [],
  "featureName": null,
  "project": null,
  "environment": null
}
```

## Tag type events

### `tag-type-created`

This event fires when you create a new tag type. The `data` property contains the tag type configuration.

```json title="example event: tag-type-created"
{
  "id": 945,
  "type": "tag-type-created",
  "createdBy": "user@company.com",
  "createdAt": "2022-06-02T13:27:01.235Z",
  "data": {
    "name": "new-tag-type",
    "description": "event testing"
  },
  "preData": null,
  "tags": [],
  "featureName": null,
  "project": null,
  "environment": null
}
```

### `tag-type-updated`

This event fires when you update a tag type. The `data` property contains the new tag type configuration.

```json title="example event: tag-type-updated"
{
  "id": 946,
  "type": "tag-type-updated",
  "createdBy": "user@company.com",
  "createdAt": "2022-06-02T13:27:31.126Z",
  "data": {
    "name": "new-tag-type",
    "description": "This tag is for testing events."
  },
  "preData": null,
  "tags": [],
  "featureName": null,
  "project": null,
  "environment": null
}
```

### `tag-type-deleted`

This event fires when you delete a tag type. The `data` property contains the name of the deleted tag type.

```json title="example event: tag-type-deleted"
{
  "id": 947,
  "type": "tag-type-deleted",
  "createdBy": "user@company.com",
  "createdAt": "2022-06-02T13:27:37.277Z",
  "data": {
    "name": "new-tag-type"
  },
  "preData": null,
  "tags": [],
  "featureName": null,
  "project": null,
  "environment": null
}
```

### `tag-type-import`

This event fires when you import a tag type as part of an import job. The `data` property contains the imported tag.

```json title="example event: tag-type-import"
{
  "id": 40,
  "type": "tag-type-import",
  "createdBy": "import-API-token",
  "createdAt": "2022-06-03T11:30:40.599Z",
  "data": {
    "name": "custom-tag-type",
    "description": "custom tag type",
    "icon": null
  },
  "preData": null,
  "tags": [],
  "featureName": null,
  "project": null,
  "environment": null
}
```

### `drop-tag-types`

This event fires when you drop all existing tag types as part of a configuration import. The `data.name` property will always be `"all-tag-types"`.

```json title="example event: drop-tag-types"
{
  "id": 38,
  "type": "drop-tag-types",
  "createdBy": "import-API-token",
  "createdAt": "2022-06-03T11:30:40.596Z",
  "data": {
    "name": "all-tag-types"
  },
  "preData": null,
  "tags": [],
  "featureName": null,
  "project": null,
  "environment": null
}
```

## Addon events

### `addon-config-created`

This event fires when you create an addon configuration. The `data` property contains the provider type.

```json title="example event: addon-config-created"
{
  "id": 960,
  "type": "addon-config-created",
  "createdBy": "user@company.com",
  "createdAt": "2022-06-03T10:15:45.040Z",
  "data": {
    "provider": "webhook"
  },
  "preData": null,
  "tags": [],
  "featureName": null,
  "project": null,
  "environment": null
}
```

### `addon-config-updated`

This event fires when you update an addon configuration. The `data` property contains the addon's ID and provider type.

```json title="example event: addon-config-updated"
{
  "id": 961,
  "type": "addon-config-updated",
  "createdBy": "user@company.com",
  "createdAt": "2022-06-03T10:16:11.732Z",
  "data": {
    "id": "2",
    "provider": "webhook"
  },
  "preData": null,
  "tags": [],
  "featureName": null,
  "project": null,
  "environment": null
}
```

### `addon-config-deleted`

This event fires when you update an addon configuration. The `data` property contains the addon's ID.

```json title="example event: addon-config-deleted"
{
  "id": 964,
  "type": "addon-config-deleted",
  "createdBy": "user@company.com",
  "createdAt": "2022-06-03T10:16:59.723Z",
  "data": {
    "id": "2"
  },
  "preData": null,
  "tags": [],
  "featureName": null,
  "project": null,
  "environment": null
}
```

## User events

### `user-created`

This event fires when you create a new user. The `data` property contains the user's information.

```json title="example event: user-created"
{
  "id": 965,
  "type": "user-created",
  "createdBy": "user@company.com",
  "createdAt": "2022-06-03T10:23:47.713Z",
  "data": {
    "id": 44,
    "name": "New User Name",
    "email": "newuser@company.com"
  },
  "preData": null,
  "tags": [],
  "featureName": null,
  "project": null,
  "environment": null
}
```

### `user-updated`

This event fires when you update a user. The `data` property contains the updated user information; the `preData` property contains the previous state of the user's information.

```json title="example event: user-updated"
{
  "id": 967,
  "type": "user-updated",
  "createdBy": "user@company.com",
  "createdAt": "2022-06-03T10:24:26.301Z",
  "data": {
    "id": 44,
    "name": "New User's Name",
    "email": "newuser@company.com"
  },
  "preData": {
    "id": 44,
    "name": "New User Name",
    "email": "newuser@company.com"
  },
  "tags": [],
  "featureName": null,
  "project": null,
  "environment": null
}
```

### `user-deleted`

This event fires when you delete a user. The `preData` property contains the deleted user's information.

```json title="example event: user-deleted"
{
  "id": 968,
  "type": "user-deleted",
  "createdBy": "user@company.com",
  "createdAt": "2022-06-03T10:24:49.153Z",
  "data": null,
  "preData": {
    "id": 44,
    "name": "New User's Name",
    "email": "newuser@company.com"
  },
  "tags": [],
  "featureName": null,
  "project": null,
  "environment": null
}
```

## Environment events

### `environment-import`

This event fires when you import an environment (custom or otherwise) as part of an import job. The `data` property contains the configuration of the imported environment.

```json title="example event: environment-import"
{
  "id": 24,
  "type": "environment-import",
  "createdBy": "import-API-token",
  "createdAt": "2022-06-03T11:30:40.557Z",
  "data": {
    "name": "custom-environment",
    "type": "test",
    "sortOrder": 9999,
    "enabled": true,
    "protected": false
  },
  "preData": null,
  "tags": [],
  "featureName": null,
  "project": null,
  "environment": null
}
```

### `drop-environments`

This event fires when you delete existing environments as part of an import job. The `data.name` property will always be `"all-environments"`.

```json title="example event: drop-environments"
{
  "id": 21,
  "type": "drop-environments",
  "createdBy": "import-API-token",
  "createdAt": "2022-06-03T11:30:40.549Z",
  "data": {
    "name": "all-projects"
  },
  "preData": null,
  "tags": [],
  "featureName": null,
  "project": null,
  "environment": null
}
```

## Segment events

### `segment-created`

This event fires when you create a segment. The `data` property contains the newly created segment.

```json title="example event: segment-created"
{
  "id": 969,
  "type": "segment-created",
  "createdBy": "user@company.com",
  "createdAt": "2022-06-03T10:29:43.977Z",
  "data": {
    "id": 5,
    "name": "new segment",
    "description": "this segment is for events",
    "constraints": [
      {
        "values": ["appA", "appB", "appC"],
        "inverted": false,
        "operator": "IN",
        "contextName": "appName",
        "caseInsensitive": false
      }
    ],
    "createdBy": "user@company.com",
    "createdAt": "2022-06-03T10:29:43.974Z"
  },
  "preData": null,
  "tags": [],
  "featureName": null,
  "project": null,
  "environment": null
}
```

### `segment-updated`

This event fires when you update a segment's configuration. The `data` property contains the new segment configuration; the `preData` property contains the previous segment configuration.

```json title="example event: segment-updated"
{
  "id": 970,
  "type": "segment-updated",
  "createdBy": "user@company.com",
  "createdAt": "2022-06-03T10:29:59.892Z",
  "data": {
    "id": 5,
    "name": "new segment",
    "description": "this segment is for events",
    "constraints": [],
    "createdBy": "user@company.com",
    "createdAt": "2022-06-03T10:29:43.974Z"
  },
  "preData": {
    "id": 5,
    "name": "new segment",
    "createdAt": "2022-06-03T10:29:43.974Z",
    "createdBy": "user@company.com",
    "constraints": [
      {
        "values": ["appA", "appB", "appC"],
        "inverted": false,
        "operator": "IN",
        "contextName": "appName",
        "caseInsensitive": false
      }
    ],
    "description": "this segment is for events"
  },
  "tags": [],
  "featureName": null,
  "project": null,
  "environment": null
}
```

### `segment-deleted`

This event fires when you delete a segment.

```json title="example event: segment-deleted"
{
  "id": 971,
  "type": "segment-deleted",
  "createdBy": "user@company.com",
  "createdAt": "2022-06-03T10:30:08.128Z",
  "data": {},
  "preData": null,
  "tags": [],
  "featureName": null,
  "project": null,
  "environment": null
}
```
