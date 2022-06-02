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
| `createdAt`   | The time the event happened as a RFC 3339-conformant timestamp.                                       |
| `data`        | Any extra associated data related to the event, such as feature toggle state, if applicable.          |
| `environment` | The feature toggle environment the event relates to, if applicable.                                   |
| `featureName` | The name of the feature toggle the event relates to, if applicable.                                   |
| `id`          | The ID of the event. An increasing natural number.                                                    |
| `preData`     | For events with new state in the `data` property, the `preData` property contains the previous state. |
| `project`     | The project the event relates to, if applicable.                                                      |
| `tags`        | Any tags related to the event, if applicable.                                                         |
| `type`        | The event type, as described in the rest of this section.                                             |


### Feature toggle events

These events pertain to feature toggles and their life cycle.

#### `feature-created`

This event fires when you create a feature. The `data` property contains the details for the new feature.

``` json title="example event: feature-created"
{
  "id": 899,
  "type": "feature-created",
  "createdBy": "thomas@getunleash.ai",
  "createdAt": "2022-05-31T13:32:20.560Z",
  "data": {
    "name": "new-toggle",
    "description": "Toggle description",
    "type": "release",
    "project": "heartman-for-test",
    "stale": false,
    "variants": [],
    "createdAt": "2022-05-31T13:32:20.547Z",
    "lastSeenAt": null,
    "impressionData": true
  },
  "preData": null,
  "tags": [],
  "featureName": "new-toggle",
  "project": "heartman-for-test",
  "environment": null
}
```

#### `feature-deleted`

This event fires when you delete a feature toggle. The `preData` property contains the deleted toggle data.

``` json title="example event: feature-deleted"
{
  "id": 903,
  "type": "feature-deleted",
  "createdBy": "admin-account",
  "createdAt": "2022-05-31T14:06:14.574Z",
  "data": null,
  "preData": {
    "name": "new-toggle",
    "type": "experiment",
    "stale": false,
    "project": "heartman-for-test",
    "variants": [],
    "createdAt": "2022-05-31T13:32:20.547Z",
    "lastSeenAt": null,
    "description": "Toggle description",
    "impressionData": true
  },
  "tags": [],
  "featureName": "new-toggle",
  "project": "heartman-for-test",
  "environment": null
}
```

#### `feature-updated`
:::caution Deprecation notice
This event type was replaced by more granular event types in Unleash 4.3. From Unleash 4.3 onwards, you'll need to use the events listed later in this section instead.
:::

This event fires when a feature gets updated in some way. The `data` property contains the new state of the toggle. This is a legacy event, so it does not populate `preData` property.


``` json title="example event: feature-updated"
{
  "id": 899,
  "type": "feature-updated",
  "createdBy": "thomas@getunleash.ai",
  "createdAt": "2022-05-31T13:32:20.560Z",
  "data": {
    "name": "new-toggle",
    "description": "Toggle description",
    "type": "release",
    "project": "heartman-for-test",
    "stale": false,
    "variants": [],
    "createdAt": "2022-05-31T13:32:20.547Z",
    "lastSeenAt": null,
    "impressionData": true
  },
  "preData": null,
  "tags": [],
  "featureName": "new-toggle",
  "project": "heartman-for-test",
  "environment": null
}
```

#### `feature-metadata-updated`

This event fires when a feature's metadata (its description, toggle type, or impression data settings) are changed. The `data` property contains the new toggle data. The `preData` property contains the toggle's previous data.

The below example changes the toggle's type from *release* to *experiment*.

``` json title="example event: feature-metadata-updated"
{
  "id": 901,
  "type": "feature-metadata-updated",
  "createdBy": "thomas@getunleash.ai",
  "createdAt": "2022-05-31T13:35:25.244Z",
  "data": {
    "name": "new-toggle",
    "description": "Toggle description",
    "type": "experiment",
    "project": "heartman-for-test",
    "stale": false,
    "variants": [],
    "createdAt": "2022-05-31T13:32:20.547Z",
    "lastSeenAt": null,
    "impressionData": true
  },
  "preData": {
    "name": "new-toggle",
    "type": "release",
    "stale": false,
    "project": "heartman-for-test",
    "variants": [],
    "createdAt": "2022-05-31T13:32:20.547Z",
    "lastSeenAt": null,
    "description": "Toggle description",
    "impressionData": true
  },
  "tags": [],
  "featureName": "new-toggle",
  "project": "heartman-for-test",
  "environment": null
}
```

#### `feature-project-change`

This event fires when you move a feature from one project to another.

[... explain more in depth]

#### `feature-archived`

This event fires when you archive a toggle.

``` json title="example event: feature-archived"
{
  "id": 902,
  "type": "feature-archived",
  "createdBy": "thomas@getunleash.ai",
  "createdAt": "2022-05-31T14:04:38.661Z",
  "data": null,
  "preData": null,
  "tags": [],
  "featureName": "new-toggle",
  "project": "heartman-for-test",
  "environment": null
}
```

#### `feature-revived`

This event fires when you revive an archived feature toggle (when you take a toggle out from the archive).

``` json title="example-event: feature-revived"
{
  "id": 914,
  "type": "feature-revived",
  "createdBy": "thomas@getunleash.ai",
  "createdAt": "2022-06-01T09:57:10.719Z",
  "data": null,
  "preData": null,
  "tags": [],
  "featureName": "new-toggle",
  "project": "heartmans-other-project",
  "environment": null
}
```

#### `feature-import`

This event fires when you import a feature ...

#### `feature-tagged`

This event fires when you add a tag to a feature. The `data` property contains the new tag.

``` json title="example event: feature-tagged"
{
  "id": 897,
  "type": "feature-tagged",
  "createdBy": "thomas@getunleash.ai",
  "createdAt": "2022-05-31T13:06:31.047Z",
  "data": {
    "type": "simple",
    "value": "tag2"
  },
  "preData": null,
  "tags": [],
  "featureName": "heartmans-constrained-toggle",
  "project": null,
  "environment": null
}
```

#### `feature-tag-import`

This event fires when you import a tag. ...

#### `feature-strategy-update`

This event fires when you update a feature strategy. The `data` property contains the new strategy configuration. The `preData` property contains the previous strategy configuration.

``` json title="example event: feature-strategy-update"
{
  "id": 920,
  "type": "feature-strategy-update",
  "createdBy": "thomas@getunleash.ai",
  "createdAt": "2022-06-01T10:03:11.549Z",
  "data": {
    "id": "3f4bf713-696c-43a4-8ce7-d6c607108858",
    "name": "flexibleRollout",
    "constraints": [],
    "parameters": {
      "groupId": "new-toggle",
      "rollout": "32",
      "stickiness": "default"
    }
  },
  "preData": {
    "id": "3f4bf713-696c-43a4-8ce7-d6c607108858",
    "name": "flexibleRollout",
    "parameters": {
      "groupId": "new-toggle",
      "rollout": "67",
      "stickiness": "default"
    },
    "constraints": []
  },
  "tags": [],
  "featureName": "new-toggle",
  "project": "heartmans-other-project",
  "environment": "default"
}
```

#### `feature-strategy-add`

This event fires when you add a strategy to a feature. The `data` property contains the configuration for the new strategy.

``` json title="example event: feature-strategy-add"
{
  "id": 919,
  "type": "feature-strategy-add",
  "createdBy": "thomas@getunleash.ai",
  "createdAt": "2022-06-01T10:03:08.290Z",
  "data": {
    "id": "3f4bf713-696c-43a4-8ce7-d6c607108858",
    "name": "flexibleRollout",
    "constraints": [],
    "parameters": {
      "groupId": "new-toggle",
      "rollout": "67",
      "stickiness": "default"
    }
  },
  "preData": null,
  "tags": [],
  "featureName": "new-toggle",
  "project": "heartmans-other-project",
  "environment": "default"
}
```

#### `feature-strategy-remove`

This event fires when you remove a strategy from a feature. The `preData` contains the configuration of the strategy that was removed.

``` json title="example event: feature-strategy-remove"
{
  "id": 918,
  "type": "feature-strategy-remove",
  "createdBy": "thomas@getunleash.ai",
  "createdAt": "2022-06-01T10:03:00.229Z",
  "data": null,
  "preData": {
    "id": "9591090e-acb0-4088-8958-21faaeb7147d",
    "name": "default",
    "parameters": {},
    "constraints": []
  },
  "tags": [],
  "featureName": "new-toggle",
  "project": "heartmans-other-project",
  "environment": "default"
}
```

#### `drop-feature-tags`

This event fires when you drop all existing tags as part of a configuration import.

...

#### `feature-untagged`

This event fires when you remove a tag from a toggle. The `data` property contains the tag that was removed.

``` json title="example event: feature-untagged"
{
  "id": 893,
  "type": "feature-untagged",
  "createdBy": "thomas@getunleash.ai",
  "createdAt": "2022-05-31T12:58:10.241Z",
  "data": {
    "type": "simple",
    "value": "thisisatag"
  },
  "preData": null,
  "tags": [],
  "featureName": "heartmans-constrained-toggle",
  "project": null,
  "environment": null
}
```

#### `feature-stale-on`

This event fires when you mark a feature as stale.

``` json title="example event: feature-stale-on"
{
  "id": 926,
  "type": "feature-stale-on",
  "createdBy": "thomas@getunleash.ai",
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
  "featureName": "new-toggle",
  "project": "heartmans-other-project",
  "environment": null
}
```

#### `feature-stale-off`

This event fires when you mark a stale feature as no longer being stale.

``` json title="example event: feature-stale-off"
{
  "id": 928,
  "type": "feature-stale-off",
  "createdBy": "thomas@getunleash.ai",
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
  "featureName": "new-toggle",
  "project": "heartmans-other-project",
  "environment": null
}
```

#### `drop-features`

#### `feature-environment-enabled`

This event fires when you enable an environment for a feature. The `environment` property contains the name of the environment.

``` json title="example event: feature-environment-enabled"
{
  "id": 930,
  "type": "feature-environment-enabled",
  "createdBy": "thomas@getunleash.ai",
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
  "featureName": "new-toggle",
  "project": "heartmans-other-project",
  "environment": "development"
}
```

#### `feature-environment-disabled`

This event fires when you disable an environment for a feature. The `environment` property contains the name of the environment.

``` json title="example event: feature-environment-disabled"
{
  "id": 931,
  "type": "feature-environment-disabled",
  "createdBy": "thomas@getunleash.ai",
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
  "featureName": "new-toggle",
  "project": "heartmans-other-project",
  "environment": "development"
}
```

### Strategy events

#### `strategy-created`

This event fires when you create a strategy. The `data` property contains the strategy configuration.

``` json

```

#### `strategy-deleted`

This event fires when you delete a strategy. The `data` property contains the name of the deleted strategy.

``` json

```

#### `strategy-deprecated`

This event fires when you deprecate a strategy. The `data` property contains the name of the deprecated strategy.

``` json

```

#### `strategy-reactivated`

This event fires when you bring reactivate a deprecated strategy.
The `data` property contains the name of the reactivated strategy.

``` json

```

#### `strategy-updated`

This event fires when you change a strategy's configuration.
The `data` property contains the new strategy configuration.

``` json

```

#### `strategy-import`

This event fires when you import a strategy ...

``` json

```

#### `drop-strategies`

This event fires when

``` json

```


### Context field events

#### `context-field-created`

This event fires when you create a context field.
The `data` property contains the context field configuration.

``` json

```

#### `context-field-updated`

This event fires when you update a context field.
The `data` property contains the new context field configuration.

``` json

```

#### `context-field-deleted`

This event fires when you delete a context field.
The `data` property contains the name of the deleted context field.

``` json

```


### Project events

#### `project-created`

This event fires when

``` json

```

#### `project-updated`

This event fires when

``` json

```

#### `project-deleted`

This event fires when

``` json

```

#### `project-import`

This event fires when

``` json

```

#### `drop-projects`

This event fires when

``` json

```


### Tag events

#### `tag-created`

This event fires when

``` json

```

#### `tag-deleted`

This event fires when

``` json

```

#### `tag-import`

This event fires when

``` json

```

#### `drop-tags`

This event fires when

``` json

```



### Tag type events

#### `tag-type-created`

This event fires when

``` json

```

#### `tag-type-deleted`

This event fires when

``` json

```

#### `tag-type-updated`

This event fires when

``` json

```

#### `tag-type-import`

This event fires when

``` json

```

#### `drop-tag-types`

This event fires when

``` json

```



### Addon events

#### `addon-config-created`

This event fires when

``` json

```

#### `addon-config-updated`

This event fires when

``` json

```

#### `addon-config-deleted`

This event fires when

``` json

```



### User events

#### `user-created`

This event fires when

``` json

```

#### `user-updated`

This event fires when

``` json

```

#### `user-deleted`

This event fires when

``` json

```



### Environment events (Enterprise)

#### `drop-environments`

This event fires when

``` json

```

#### `environment-import`

This event fires when

``` json

```


### Segment events

#### `segment-created`

This event fires when

``` json

```

#### `segment-updated`

This event fires when

``` json

```

#### `segment-deleted`

This event fires when

``` json

```
