---
title: Impression data
---

:::info

Availability The impression data feature was introduced in **Unleash 4.7**. It is available in the JavaScript-based proxy clients and in some server-side SDKs. Please refer to the [SDK compatibility table](../sdks/index.md#server-side-sdk-compatibility-table) for an overview of server-side SDKs that support it.

:::

Unleash can provide you with **impression data** about the toggles in your application. Impression data contains information about a specific feature toggle activation check: The client SDK will emit an **impression event** whenever it calls `isEnabled` or `getVariant`.

Impression data was designed to make it easier for you to **collect analytics data**, **perform A/B tests**, and **enrich experiments** in your applications. It contains information about the feature toggle and the related [Unleash Context](../user_guide/unleash-context.md).

Impression data is **opt-in on a per-toggle basis**. Unleash will not emit impression events for toggles not marked as such. Once you've turned impression data on for a toggle, you can start listening for impression events in your client SDK.

## Impression event data

There's two types of impression events you can listen for:

- [`isEnabled` events](#example-isenabled)
- [`getVariant` events](#example-getvariant)

The `getVariant` event contains all the information found in an `isEnabled` event in addition to extra data that's only relevant to `getVariant` calls.

This table describes all the properties on the impression events:

| Property name | Description | Event type |
| --- | --- | --- |
| `eventType` | The type of the event: `isEnabled` or `getVariant` | All |
| `eventId` | A globally unique id (GUID) assigned to this event. | All |
| `context` | A representation of the current [Unleash Context](../user_guide/unleash-context.md). | All |
| `enabled` | Whether the toggle was enabled or not at when the client made the request. | All |
| `featureName` | The name of the feature toggle. | All |
| `variant` | The name of the active variant | `getVariant` events only |

### Example `isEnabled` event {#example-isenabled}

```js
{
  eventType: 'isEnabled',
  eventId: '84b41a43-5ba0-47d8-b21f-a60a319607b0',
  context: {
    sessionId: 54085233,
    appName: 'my-webapp',
    environment: 'default'
  },
  enabled: true,
  featureName: 'my-feature-toggle',
}
```

### Example `getVariant` event {#example-getvariant}

```js
{
  eventType: 'getVariant',
  eventId: '84b41a43-5ba0-47d8-b21f-a60a319607b0',
  context: {
    sessionId: 54085233,
    appName: 'my-webapp',
    environment: 'default'
  },
  enabled: true,
  featureName: 'my-feature-toggle',
  variant: 'variantA'
}
```

## Enabling impression data

Impression data is strictly an **opt-in** feature and must be enabled on a **per-toggle basis**. You can enable and disable it both when you create a toggle and when you edit a toggle.

You can enable impression data via the impression data toggle in the admin UI's toggle creation form. You can also go via the [the API, using the `impressionData` option](../api/admin/feature-toggles-api-v2.md#create-toggle). For more detailed instructions, see [the section on enabling impression data in the how-to guide for capturing impression data](../how-to/how-to-capture-impression-data.mdx#step-1).

![A feature toggle creation form. At the end of the form is a heading that says "Impression data", a short paragraph that describes the feature, and a toggle to opt in or out of it.](/img/create_feat_impression.png)

## Example setup

The exact setup will vary depending on your [client SDK](../sdks/index.md). The below example configures the [Unleash Proxy client](/sdks/proxy-javascript) to listen for impression events and log them to the console. If "my-feature-toggle" is configured to emit impression data, then it will trigger an impression event as soon as Unleash is ready.

```js
const unleash = new UnleashClient({
  url: 'https://eu.unleash-hosted.com/hosted/proxy',
  clientKey: 'your-proxy-key',
  appName: 'my-webapp',
});

unleash.start();

unleash.on('ready', () => {
  unleash.isEnabled('my-feature-toggle');
});

unleash.on('impression', (event) => {
  // Capture the event here and pass it internal data lake or analytics provider
  console.log(event);
});
```
