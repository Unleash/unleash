---
id: webhook
title: Webhook
---

> This feature was introduced in _Unleash v3.11.0_.

The Webhook Addon introduces a generic way to post messages from Unleash to third party services. Unleash allows you to define a webhook which listens changes in Unleash and post them to a third party services.

The webhook will perform a single retry if the HTTP POST call fails (either a 50x or network error). Duplicate events may happen,m and you should never assume events always comes in order.

## Configuration

#### Events

You can choose to trigger updates for the following events (we might add more event types in the future):

- feature-created
- feature-updated
- feature-archived
- feature-revived

#### Parameters

Unleash Webhook addon takes the following parameters.

**Webhook URL** This is the only required property. If you are using a Slack Application you must also make sure your application is allowed to post the channel you want to post to.

**Content-Type** Used to set the content-type header used when unleash performs a HTTP POST to the defined endpoint.

**Body template** Used to override the body template used by Unleash when performing the HTTP POST. You may format you message using a [Mustache template](https://mustache.github.io). You will have the [Unleash event format](/docs/api/admin/events) available in the rendering context.

Example:

```mustache
{
  "event": "{{event.type}}",
  "createdBy": "{{event.createdBy}}",
  "featureToggle": "{{event.data.name}}",
  "timestamp": "{{event.data.createdAt}}"
}
```

If you don't specify anything Unleash will use the [Unleash event format](/docs/api/admin/events).
