---
title: Quick Start
---

There are lots of options to get started with Unleash. If you're comfortable with Docker, this is the fastest way to get up and running. If that's not you, here are [some additional ways to try Unleash](#more-unleash).

## 1. Set up Unleash with Docker {#setup-unleash-docker}

The easiest way to run unleash locally is using git and [docker](https://www.docker.com/).

```sh
git clone git@github.com:Unleash/unleash.git
cd unleash
docker compose up -d
```

## 2. Log in to the Admin UI

Then point your browser to localhost:4242 and log in using:

```
username: admin
password: unleash4all
```

## 3. Create your first flag {#create-a-flag}

1. Navigate to the Feature flags list
2. Click 'New feature flag'
3. Give it a unique name, and click 'Create feature flag'

For a detailed guide on how to create a flag through the UI, [you can follow this guide](/how-to/how-to-create-feature-toggles.md).

## 4a. Connect a client-side SDK {#connect-a-client-side-sdk}

To try Unleash with a client-side technology, create a [front-end token](/reference/api-tokens-and-client-keys.mdx#front-end-tokens) and use `<your-unleash-instance>/api/frontend` as the API URL.

Now you can open your application code and connect through one of the [client-side SDKs](/reference/sdks#client-side-sdks).

The following example shows you how you could use the [JavaScript SDK](/generated/sdks/client-side/javascript-browser.md) to connect to the Unleash demo frontend API:

```javascript
import { UnleashClient } from "unleash-proxy-client";

const unleash = new UnleashClient({
    url: "https://<your-unleash-instance>/api/frontend",
    clientKey: "<your-token>",
    appName: "<your-app-name>",
});

unleash.on("synchronized", () => {
    // Unleash is ready to serve updated feature flags.

    // Check a feature flag
    if (unleash.isEnabled("some-flag")) {
        // do cool new things when the flag is enabled
    }
});
```

## 4b. Connect a backend SDK {#connect-a-backend-sdk}

To try Unleash with a server-side technology, create a [client token](/reference/api-tokens-and-client-keys#client-tokens) and use `<your-unleash-instance>/api` as the API URL.

Now you can open up your application code and create a connection to Unleash using one of our [SDKs](/reference/sdks/index.md). Here's an example using the [NodeJS SDK](/reference/sdks/node) to connect to the Unleash demo instance:

```javascript
const { initialize } = require("unleash-client");
const unleash = initialize({
    url: "https://<your-unleash-instance>/api/",
    appName: "<your-app-name>",
    customHeaders: {
        Authorization: "<your-token>",
    },
});

unleash.on("synchronized", () => {
    // Unleash is ready to serve updated feature flags.

    if (unleash.isEnabled("some-flag")) {
        // do cool new things when the flag is enabled
    }
});
```

## Additional Ways to Try Unleash {#more-unleash}

### Unleash Demo Instance {#unleash-demo-instance}

For testing purposes we have set up a demo instance that you can use in order to test out different use-cases before setting up your own instance. You can find the demo instance here: https://app.unleash-hosted.com/demo/

NOTE: This is a demo instance set up with the Enterprise version. [More information on our different versions](https://www.getunleash.io/pricing).

If you don't have your own Unleash instance set up, you can use the Unleash demo instance. In that case, the details are:

**Client Side**

-   API URL: `https://app.unleash-hosted.com/demo/api/frontend`
-   Frontend key: `demo-app:default.bf8d2a449a025d1715a28f218dd66a40ef4dcc97b661398f7e05ba67`

**Server Side**

-   API URL: `https://app.unleash-hosted.com/demo/api`
-   Client key: `56907a2fa53c1d16101d509a10b78e36190b0f918d9f122d`

Curl command to test credentials and retrieve feature flags:

```
curl https://app.unleash-hosted.com/demo/api/client/features \
-H "Authorization: 56907a2fa53c1d16101d509a10b78e36190b0f918d9f122d";
```

### Unleash Pro & Enterprise Instances {#unleash-pro-and-enterprise-instances}

You can run Unleash in the cloud by using our hosted offerings. Please see the [plans page](https://www.getunleash.io/pricing) to learn more.

### Other Local Setup Options

There are several [more options to get started locally.](using-unleash/deploy/getting-started.md)
