---
id: datadog
title: Datadog
---

import SearchPriority from '@site/src/components/SearchPriority';

<SearchPriority level="high" />

:::note Availability

**Version**: `4.0+`

:::

The Datadog integration allows Unleash to post Updates to Datadog when a feature flag is updated. To set up this integration, you need to set up a webhook connector for your channel. You can follow [Submitting events to Datadog](https://docs.datadoghq.com/api/latest/events/#post-an-event) on how to do that.

The Datadog integration will perform a single retry if the HTTP POST against the Datadog Webhook URL fails (either a 50x or network error). Duplicate events may happen, and you should never assume events always comes in order.

## Configuration

#### Events

You can choose to trigger updates for the following events:

- feature-created
- feature-metadata-updated
- feature-project-change
- feature-archived
- feature-revived
- feature-strategy-update
- feature-strategy-add
- feature-strategy-remove
- feature-stale-on
- feature-stale-off
- feature-environment-enabled
- feature-environment-disabled
- feature-environment-variants-updated
- feature-potentially-stale-on
- feature-updated (deprecated in v4.3)

#### Parameters

Unleash Datadog integration takes the following parameters.

- **Datadog Events URL** - This is an optional property. The default URL is https://api.datadoghq.com/api/v1/events. If you are not not using the US1 [Datadog site](https://docs.datadoghq.com/getting_started/site/), you'll need to change this. Some instances and their URLs are:
  - EU: https://app.datadoghq.eu/api/v1/events
  - US1: https://app.datadoghq.com/api/v1/events
  - US3: https://us3.datadoghq.com/api/v1/events
  - US1-FED: https://app.ddog-gov.com/api/v1/events


- **Datadog API key** - This is a required property. The API key to use to authenticate with Datadog.

- **Datadog Source Type Name** - This is an optional property. Sets `source_type_name` parameter to be included in Datadog events. [List of valid api source values](https://docs.datadoghq.com/integrations/faq/list-of-api-source-attribute-value/)

- **Extra HTTP Headers** - This is an optional property. Used to set the additional headers when Unleash communicates with Datadog.

Example:

```json
{
  "SOME_CUSTOM_HTTP_HEADER": "SOME_VALUE",
  "SOME_OTHER_CUSTOM_HTTP_HEADER": "SOME_OTHER_VALUE"
}
```

:::info Body template availability

The body template property is available from **Unleash 5.6** onwards.

:::

- **Body template** - This is an optional property. The template is used to override the body template used by Unleash when performing the HTTP POST. You can format your message using a [Mustache template](https://mustache.github.io). Refer to the [Unleash event types](/concepts/events#event-types) reference to find out which event properties you have access to in the template.

Example:

```mustache
{
  "event": "{{event.type}}",
  "createdBy": "{{event.createdBy}}",
  "featureToggle": "{{event.data.name}}",
  "timestamp": "{{event.data.createdAt}}"
}
```

If you don't specify anything Unleash will send a formatted markdown body.

Example:

```markdown
username created feature flag (featurename)[http://your.url/projects/projectname/features/featurename] in project *projectname*
```

#### Tags

Datadog's incoming webhooks are app specific. You will be able to create multiple integrations to support messaging on different apps.
