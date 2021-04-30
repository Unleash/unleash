---
id: datadog
title: Datadog
---

> This feature was introduced in \_Unleash v4.0.x.

The Datadog addon allows Unleash to post Updates when a feature toggle is updated. To set up this addon, you need to set up a webhook connector for your channel. You can follow [Submitting events to Datadog](https://docs.datadoghq.com/api/latest/events/#post-an-event) on how to do that.

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

- **Datadog Events URL** - This property is optional. The default url is https://api.datadoghq.com/api/v1/events
- **DD API KEY** - This is a required property.

#### Tags

Datadog's incoming webhooks are app specific. You will be able to create multiple addons to support messaging on different apps.
