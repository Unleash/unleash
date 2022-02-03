---
id: impression_data
title: Impression data
---

Impression data represents that unleash uses locally in order to resolve a feature toggle to true or false. This data does not leave your application, and the data is not sent to unleash - but it is used for the purposes of resolving feature toggles.

Since this data lives in your own application, and you pass this data into the SDK, it can be useful to know what the data looks like when a feature toggle is evaluated. You can then use this data to send to your analytics provider to enrich experiments and track feature usage.

You can turn on impression data for a toggle, which will allow that toggle to emit an impression event in the client SDKs which are located in your application, which you can listen to and act upon in your own code.

## Step 1: Create a feature toggle with impression data

Go to the admin UI and navigate to the create feature toggle screen:

![Impression data switch](/img/create_feat_impression.png)

In the bottom section you'll see a switch to turn on impression data for this feature toggle. Click the switch to enable the feature. Alternatively, you can send the following payload to the unleash API to create a feature toggle with the impression data enabled:

```
curl --location --request POST 'http://{YOUR_DOMAIN}/api/admin/projects/{PROJECT_ID}/features' \
    --header 'Authorization: {INSERT_API_KEY}' \
    --header 'Content-Type: application/json' \
    --data-raw '{
  "type": "release",
  "name": "my-feature-toggle",
  "description": "",
  "impressionData": true
}'
```

## Step 2: Use the impression event in your client application

This step assumes that you have set up an application connected to an unleash instance using one of our [SDKs](/sdks)

:::caution 
Currently this functionality is only supported in [unleash-proxy-client](/sdks/proxy-javascript) and [proxy-client-react](/sdks/proxy-react)
:::

Once you have set up your client application with the SDK you can listen to impression events on the client. Example with unleash-proxy-client:

```
const unleash = new UnleashClient({
  url: 'https://eu.unleash-hosted.com/hosted/proxy',
  clientKey: 'your-proxy-key',
  appName: 'my-webapp',
});

unleash.start();

unleash.on("ready", () => {
  unleash.isEnabled("my-feature-toggle");
})

unleash.on("impression", (event) => {
  // Capture the event here and pass it internal data lake or analytics provider
  console.log(event);
})
```

This will allow you to capture an event whenever a call is done to isEnabled or getVariant, capturing the context of the call which you can use to enrich your own data. The impression event will contain the following data, including the entire context of the call (which will expand if you provide more values to the unleash context): 

```
// Example isEnabled event
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


// Example getVariant event
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

Once the event is captured, you can do whatever you'd like with it in the event handler body.


