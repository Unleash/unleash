---
id: datadog
title: Datadog
---

> This feature was introduced in _Unleash v4.0.0_.

The Datadog addon allows Unleash to post Updates to Datadog when a feature toggle is updated. To set up this addon, you need to set up a webhook connector for your channel. You can follow [Submitting events to Datadog](https://docs.datadoghq.com/api/latest/events/#post-an-event) on how to do that.

The Datadog addon will perform a single retry if the HTTP POST against the Datadog Webhook URL fails (either a 50x or network error). Duplicate events may happen, and you should never assume events always comes in order.

## Configuration

#### Events

You can choose to trigger updates for the following events (we might add more event types in the future):

- feature-created
- feature-updated
- feature-archived
- feature-revived
- feature-stale-on
- feature-stale-off

#### Parameters

Unleash Datadog addon takes the following parameters.

- **Datadog Events URL** - This property is optional. The default url is https://api.datadoghq.com/api/v1/events. Needs to be changed if you are not not on the US1 [Datadog site](https://docs.datadoghq.com/getting_started/site/). Possible alternatives:
  - EU: https://app.datadoghq.eu/api/v1/events
  - US1: https://app.datadoghq.com/api/v1/events
  - US3: https://us3.datadoghq.com/api/v1/events
  - US1-FED: https://app.ddog-gov.com/api/v1/events
- **DD API KEY** - This is a required property.

#### Tags

Datadog's incoming webhooks are app specific. You will be able to create multiple addons to support messaging on different apps.
