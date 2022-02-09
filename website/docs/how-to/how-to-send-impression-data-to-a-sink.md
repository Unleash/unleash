---
title: How to send impression data to a sink
---

Unleash allows you to gather [**impression data**](../advanced/impression-data.md) from your feature toggles, giving you complete visibility into who checked what toggles and when. What you do with this data is entirely up to you, but a common use case is to send it off to an aggregation and analytics service such as [Posthog](https://posthog.com/) or [Google Analytics](https://analytics.google.com/).

This guide will take you through everything you need to do in Unleash to facilitate such a workflow. It will show you how to send data to Posthog as an example sink, but the exact same principles will apply to any other service of the same kind.

## Prerequisites

We will assume that you have the necessary details for your third-party service:

- **where to send the data to**. We'll refer to this in the code samples below as **`<sink-url>`**.
- **what format the data needs to be in**. This will determine how you transform the event data before you send it.

In addition you'll need to have a toggle to record impression data for and an [Unleash client SDK](../sdks/index.md) that supports impression data. This guide will use the [JavaScript proxy SDK](../sdks/proxy-javascript.md).

When you have those things sorted, follow the below steps.

## Enable impression data for your feature toggle {#step-1}

Because impression data is an **opt-in feature**, the first step is to enable it for the feature you want to gather data from. You can use both the UI and the API.

### Enabling impression data for new feature toggles

When you create a new feature toggle via the UI, there's an option at the end of the form that you must enable.

![The create feature toggle form. There's a toggle at the end of the form that enables or disables impression data. It's labeled "impression data".](/img/enable-impression-data.png)

### Enabling impression data for existing feature toggles


## Capture impression events in your client {#step-2}

### Initialize your analytics service

``` js
posthog.identify(userId);
```

### Set up a listener

``` js
unleash.on("impression", (event) => {
    posthog.capture(event.eventType, {
        ...event.context,
        distinct_id: event.context?.userId,
        featureName: event.featureName,
        enabled: event.enabled,
        variant: event.variant,
    });
});
```

option:


``` js
unleash.on("impression", (event) => {
    posthog.capture(event.eventType, transform(event));
});
```

### Transform and record the data {#step-3}

Posthog requires the `distinct_id` property. For the rest, we'll just spread everything into a flat object.

``` js
const transform = (event) => ({
    ...event.context,
    distinct_id: event.context?.userId,
    featureName: event.featureName,
    enabled: event.enabled,
    variant: event.variant,
})
```

## Full example

```js
import posthog from "posthog-js";

const unleash = new UnleashClient({
  url: 'https://eu.unleash-hosted.com/hosted/proxy',
  clientKey: 'your-proxy-key',
  appName: 'my-webapp',
});

posthog.identify(userId);

unleash.start();

unleash.on("ready", () => {
  unleash.isEnabled("my-feature-toggle");
})

unleash.on("impression", (event) => {
    posthog.capture(event.eventType, {
        ...event.context,
        distinct_id: event.context?.userId,
        featureName: event.featureName,
        enabled: event.enabled,
        variant: event.variant,
    });
})
```
