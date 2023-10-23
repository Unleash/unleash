---
id: getting-started
title: Getting Started
---

## Set up Unleash {#set-up-unleash}

### Run Unleash in Docker {#run-unleash-in-docker}

The easiest way to run unleash locally is using git and [docker](https://www.docker.com/).

```sh
git clone git@github.com:Unleash/unleash.git
cd unleash
docker compose up -d
```

[Click here to see all options to get started locally.](reference/deploy/getting-started.md)

Then point your browser to localhost:4242 and log in using:

```
username: admin
password: unleash4all
```

### Unleash Demo Instance {#unleash-demo-instance}

For testing purposes we have set up a demo instance that you can use in order to test out different use-cases before setting up your own instance. You can find the demo instance here: https://app.unleash-hosted.com/demo/

NOTE: This is a demo instance set up with the Enterprise version. Some of the functionality may be enterprise specific, but everything we cover here is also available in open source.

### Unleash Pro & Enterprise Instances {#unleash-pro-and-enterprise-instances}

You can run Unleash in the cloud by using our hosted offerings. Please see the [plans page](https://www.getunleash.io/pricing) to learn more. 

## Create your first flag {#create-a-flag}

**Step 1: Navigate to the Feature toggles list**

**Step 2: Click 'New feature toggle'**

**Step 3: Give it a unique name, and click 'Create feature toggle'**

For a detailed guide on how to create a flag through the UI, [you can follow this guide](../how-to/how-to-create-feature-toggles.md). 

## Connect a client-side SDK {#connect-a-client-side-sdk}

If you have set up your own Unleash instance and are using the front-end API, then create a [front-end token](../reference/api-tokens-and-client-keys.mdx#front-end-tokens) and use `<your-unleash-instance>/api/frontend` as the API URL.

If you don't have your own Unleash instance set up, you can use the Unleash demo instance's frontend API. In that case, the details are:
- API URL: `https://app.unleash-hosted.com/demo/api/frontend`
- Frontend key: `demo-app:default.bf8d2a449a025d1715a28f218dd66a40ef4dcc97b661398f7e05ba67`

Now you can open your application code and connect through one of the [client-side SDKs](../reference/sdks#client-side-sdks).

The following example shows you how you could use the [JavaScript SDK](../generated/sdks/client-side/javascript-browser.md) to connect to the Unleash demo frontend API:

```javascript
import { UnleashClient } from 'unleash-proxy-client';

const unleash = new UnleashClient({
  url: 'https://app.unleash-hosted.com/demo/api/frontend',
  clientKey: 'demo-app:default.bf8d2a449a025d1715a28f218dd66a40ef4dcc97b661398f7e05ba67',
  appName: 'my-app-name-frontend',
});

unleash.on('synchronized', () => {
  // Unleash is ready to serve updated feature flags.

  // Check a feature flag
  if (unleash.isEnabled('some-toggle')) {
    // do cool new things when the flag is enabled 
  }
});
```

## Connect a backend SDK {#connect-a-backend-sdk}

If you have set up your own Unleash instance and want to connect using a backend SDK, then create a [client token](../reference/api-tokens-and-client-keys#client-tokens) and use `<your-unleash-instance>/api` as the API URL. 

If you don't have your own Unleash instance set up, you can use the Unleash demo instance's client key. In that case, the details are: 
- API URL: `https://app.unleash-hosted.com/demo/api`
- Client key: `56907a2fa53c1d16101d509a10b78e36190b0f918d9f122d` 

Curl command test credentials and retrieve feature toggles:

```
curl https://app.unleash-hosted.com/demo/api/client/features \
-H "Authorization: 56907a2fa53c1d16101d509a10b78e36190b0f918d9f122d";
```

Now you can open up your application code and create a connection to Unleash using one of our [SDKs](../reference/sdks/index.md). Here's an example using the NodeJS SDK to connect to the Unleash demo instance:

```javascript
const { initialize } = require('unleash-client');
const unleash = initialize({
  url: 'https://app.unleash-hosted.com/demo/api/',
  appName: 'my-app-name-backend',
  instanceId: 'my-unique-instance-id',
  customHeaders: {
    Authorization: '56907a2fa53c1d16101d509a10b78e36190b0f918d9f122d',
  },
});

unleash.on('synchronized', () => {
  // Unleash is ready to serve updated feature flags.

  if(unleash.isEnabled('some-toggle')){
    // do cool new things when the flag is enabled 
  } 
});
```
