---
title: 'Serverless feature flags: How to'
description: 'Use the Unleash Node.js SDK with AWS Lambda to implement feature flags in a serverless environment.'
slug: /guides/implement-feature-flags-in-aws-lambda
---

Developers can add feature flagging capabilities to serverless functions and validate new parts of them. Leveraging feature flags gives you complete control over feature exposure and simplifies serverless function versioning management.

For developers new to feature flags in serverless environments, this guide will walk you through practical examples using the [Unleash Node.js SDK](https://github.com/Unleash/unleash-node-sdk) in [AWS Lambda](https://aws.amazon.com/lambda/). Developers can easily adapt these concepts to other serverless solutions like [Google Cloud Functions](https://cloud.google.com/functions).

## Scenarios for AWS Lambda feature flags

-   If you make a breaking change to a serverless function (e.g., new params), you usually need to create a new version with an appropriate URL routing scheme
-   But sometimes you may need to add a non-breaking change, signature-wise, that may still have unwanted side effects for some consumers
-   You may also want to make the feature change optional until it’s been thoroughly tested
-   Feature flags enable you to release a new function version in-place while controlling who gets exposed to the new feature
-   Benefits:
    -   Simplifies serverless function version management
    -   Allows you to test the change in the real world with a subset of API consumers before going 100% live
    -   Simpler to manage than other forms of partial deployment (e.g., a canary rollout)

![AWS Lambda connecting to Unleash](/img/lambda-architecture.png)

## Step-by-step: Adding AWS Lambda feature flags

### Step 1: Initialize the SDK.

In order to use any Unleash SDK, it needs to be initialized. This is when the SDK is configured with the necessary details to connect to the Unleash API. As part of initialization, the SDK downloads the most recent configuration from Unleash. The SDK also synchronizes with the Unleash API in the background, ensuring updates propagate to the Lambda functions.

You should only initialize the Unleash SDK once during the lifespan of a serverless function. This avoids the overhead of connecting to the external Unleash API with every invocation of an AWS Lambda.

Why? AWS Lambda is designed to reuse the same instance for multiple invocations, enabling the expensive initialization process to occur only during the Lambda's "cold start." Subsequent "warm" invocations can then leverage the SDK, which has been pre-initialized, with all feature flag configurations cached in memory. This ensures efficient operation by minimizing initialization overhead and enhancing performance.

You’ll also need to provide an [Unleash Server side API Token](/reference/api-tokens-and-client-keys) as an environment variable for the AWS Lambda. This authorizes the SDK to connect to the Unleash API.

```javascript
import {
    startUnleash,
    InMemStorageProvider,
    destroyWithFlush,
} from "unleash-client";
let unleash;

async function init() {
    if (!unleash) {
        unleash = await startUnleash({
            url: "<YOUR_UNLEASH_URL>",
            appName: "lambda-example-app",
            customHeaders: {
                authorization: process.env.API_TOKEN,
            },
            storageProvider: new InMemStorageProvider(),
        });
        unleash.on("initialized", () =>
            console.log("[runtime] Unleash initialized")
        );
    }
}

export const handler = async (event, context) => {
    // Only the first invocation will trigger SDK initialization.
    await init();
    return {
        statusCode: 200,
        body: { message: `` },
    };
};
```

### Step 2: Enable graceful shutdown of the SDKs

You’ll need to handle graceful shutdown of the function in a way that preserves usage metrics when using AWS Lambda feature flags.

Fortunately, AWS Lambda receives a signal when AWS decides that the Lambda instance is not needed anymore. We can use this signal to make sure we send any outstanding cached usage metrics to Unleash API.

The code below shows how to add the listener in the “global” part of our function in order to destroy the Unleash SDK gracefully. It also flushes any outstanding metrics back to the Unleash API.

```javascript
let unleash;

process.on("SIGTERM", async () => {
    console.info("[runtime] SIGTERM received");

    if (unleash) {
        await destroyWithFlush();
        unleash = undefined;
    }

    process.exit(0);
});
```

### Step 3: Use the Unleash SDK for AWS Lambda feature flags

We’ve initialized the Unleash SDK and have code to handle graceful shutdown. It's time to start taking advantage of AWS Lambda feature flags.

Luckily this is straightforward. We can use the SDK as we would in any Node.js application. In the example below, we read the value of the **`simpleFlag`** flag and return the status as part of the JSON response from the function.

```javascript
import {
    startUnleash,
    InMemStorageProvider,
    destroyWithFlush,
} from "unleash-client";

let unleash;

async function init() {
    if (!unleash) {
        console.log("[runtime] Starting unleash");
        unleash = await startUnleash({
            url: "https://sandbox.getunleash.io/enterprise/api/",
            appName: "lambda-example-app",
            customHeaders: {
                authorization: process.env.API_TOKEN,
            },
            storageProvider: new InMemStorageProvider(),
        });
        unleash.on("initialized", () =>
            console.log("[runtime] Unleash initialized")
        );
    }
}

process.on("SIGTERM", async () => {
    console.info("[runtime] SIGTERM received");

    if (unleash) {
        await destroyWithFlush();
        unleash = null;
    }

    process.exit(0);
});

export const handler = async (event, context) => {
    // Only the first invocation will trigger SDK initialization.
    await init();

    const isEnabled = unleash.isEnabled("simpleFlag");

    return {
        statusCode: 200,
        body: {
            message: `Feature flag 'simpleFlag' is ${
                isEnabled ? "enabled" : "disabled"
            }`,
        },
    };
};
```

When we set up our Lambda function, we gave it a [public function URL](https://docs.aws.amazon.com/lambda/latest/dg/lambda-urls.html). This allows us to trigger the function easily via the URL that AWS Lambda generates.

Example:

```bash
curl https://z5w5lkzlsozutfhaixbjsj27cm0dhnfh.lambda-url.eu-north-1.on.aws

{"message":"Feature flag 'simpleFlag' is enabled"}
```

## Scaling AWS Lambda feature flags

Mastering feature flags in serverless? This guide demonstrated the surprisingly simple use of Unleash SDK. Remember, avoid initializing the SDK multiple times within your serverless function for smooth operation.

Need to scale your AWS Lambda function to thousands of requests per second (RPS)? Consider [Unleash Edge](/deploy/hosting-options#unleash-edge-options), which uses edge computing to scale your Unleash usage. You can scale in any matter you see fit - either hosted entirely in your infrastructure on your own edge services or fully managed by Unleash.

:::note Lambda Latency

If you care about latency and particularly faster cold starts you should take a look at [Low Latency Runtime](https://github.com/awslabs/llrt) (LTR) an experimental, lightweight JavaScript runtime designed to address the growing demand for fast and efficient Serverless applications. The team behind Unleash is super excited about this initiative.

:::
