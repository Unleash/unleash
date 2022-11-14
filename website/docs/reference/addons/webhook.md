---
id: webhook
title: Webhook
---

> This feature was introduced in _Unleash v3.11.0_.

The Webhook Addon introduces a generic way to post messages from Unleash to third party services. Unleash allows you to define a webhook which listens changes in Unleash and post them to a third party services.

The webhook will perform a single retry if the HTTP POST call fails (either a 50x or network error). Duplicate events may happen, and you should never assume events always comes in order.

## Configuration {#configuration}

#### Events {#events}

You can choose to trigger updates for the following events (we might add more event types in the future):

- feature-created
- feature-updated (*)
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

> *) Deprecated, and will not be used after transition to environments in Unleash v4.3

#### Parameters {#parameters}

Unleash Webhook addon takes the following parameters.

**Webhook URL** This is the only required property. If you are using a Slack Application you must also make sure your application is allowed to post the channel you want to post to.

**Content-Type** Used to set the content-type header used when unleash performs an HTTP POST to the defined endpoint.

**Body template** Used to override the body template used by Unleash when performing the HTTP POST. You may format you message using a [Mustache template](https://mustache.github.io). You will have the [Unleash event format](/api/admin/events) available in the rendering context.

Example:

```mustache
{
  "event": "{{event.type}}",
  "createdBy": "{{event.createdBy}}",
  "featureToggle": "{{event.data.name}}",
  "timestamp": "{{event.data.createdAt}}"
}
```

If you don't specify anything Unleash will use the [Unleash event format](/api/admin/events).

#### Custom SSL certificates {#certificates}

If your webhook endpoint uses a custom SSL certificate,
you will need to start Unleash with the `NODE_EXTRA_CA_CERTS` environment variable set.
It needs to point to your custom certificate file in pem format.

For more information, see the [official Node.js documentation on setting extra certificate files](https://nodejs.org/api/cli.html#node_extra_ca_certsfile).
