---
title: How to implement feature flags in a serverless environment using AWS Lambda
slug: /feature-flag-tutorials/serverless/lambda
---

For developers new to feature flags in serverless environments, this guide will walk you through practical examples using the [Unleash Node.js SDK](https://github.com/Unleash/unleash-client-node) in [AWS Lambda](https://aws.amazon.com/lambda/). These concepts can be easily adapted to other serverless solutions like [Google Cloud Functions](https://cloud.google.com/functions). Having feature flagging capabilities available inside of your serverless functions allows you to validate new parts of your serverless functions and stay in control of the feature exposure. 


![AWS Lambda connecting to Unleash](/img/lambda-architecture.png)


## Step 1: Initialize the SDK. 

In order to use any Unleash SDK, it needs to be initialized. This is when the SDK is configured with the necessary details to connect to the Unleash API. As part of initialization, the SDK downloads the most recent configuration from Unleash. The SDK also synchronizes with the Unleash API in the background, ensuring updates propagate to the Lambda functions. 

It's essential to understand that the Unleash SDK should be initialized only once during the lifespan of a serverless function. This approach is critical to avoid the overhead of connecting to the external Unleash API with every invocation of an AWS Lambda. AWS Lambda is designed to reuse the same instance for multiple invocations, enabling the expensive initialization process to occur only during the Lambda's "cold start." Subsequent "warm" invocations can then leverage the SDK, which has been pre-initialized, with all feature flag configurations cached in memory. This ensures efficient operation by minimizing initialization overhead and enhancing performance.

You will also have to provide a [Unleash Server side API](https://docs.getunleash.io/how-to/how-to-create-api-tokens) Token as an environment variable for the AWS Lambda in order for the SDK to be able to connect to the Unleash API.  


```javascript
import { startUnleash, InMemStorageProvider, destroyWithFlush } from 'unleash-client';
let unleash;

async function init() {
    if (!unleash) {
        unleash = await startUnleash({
            url: 'https://sandbox.getunleash.io/enterprise/api/',
            appName: 'lambda-example-app',
            customHeaders: {
                authorization: process.env.API_TOKEN,
            },
            storageProvider: new InMemStorageProvider(),
        });
        unleash.on('initialized', () => console.log('[runtime] Unleash initialized'));
    }    
}

export const handler = async (event, context) => {
    // Only the first invocation will trigger SDK initialization. 
    await init(); 
    return {
        statusCode: 200,
        body: {message: ``},
    };
};
```

## Step 2: Add graceful shutdown of the SDKs
It’s important to handle the case of a Lambda shutting down in a graceful manner in order to preserve usage metrics. Fortunately, AWS Lambda receives a signal when AWS decides that the Lambda instance is not needed anymore. We can use this signal to make sure we send any outstanding cached usage metrics to Unleash API. 

The code below shows how we can add the listener in the “global” part of our function in order to destroy the Unleash SDK gracefully and make sure we flush any outstanding metrics back to the Unleash API. 


```javascript
let unleash;

process.on('SIGTERM', async () => {
    console.info('[runtime] SIGTERM received');

    if(unleash) {
        await destroyWithFlush();
        unleash = undefined;
    }
   
    process.exit(0)
});

```

### Step 3: Use the Unleash SDK for feature flagging

Now that we have Unleash SDK properly initialized and we have a graceful shutdown hook, it's time to start taking advantage of feature flags in our serverless function. 

Luckily this is relatively straightforward, and we can just use the SDK as we would in any Node.js application. In the example below, we read the value of the “**simpleFlag**” and return the status as part of the JSON response from the function. 

```javascript
import { startUnleash, InMemStorageProvider, destroyWithFlush } from 'unleash-client';

let unleash;

async function init() {
    if (!unleash) {
        console.log('[runtime] Starting unleash');
        unleash = await startUnleash({
            url: 'https://sandbox.getunleash.io/enterprise/api/',
            appName: 'lambda-example-app',
            customHeaders: {
                authorization: process.env.API_TOKEN,
            },
            storageProvider: new InMemStorageProvider(),
        });
        unleash.on('initialized', () => console.log('[runtime] Unleash initialized'));
    }    
}

process.on('SIGTERM', async () => {
    console.info('[runtime] SIGTERM received');

    if(unleash) {
        await destroyWithFlush();
        unleash = undefined;
    }
   
    process.exit(0)
});

export const handler = async (event, context) => {
    // Only the first invocation will trigger SDK initialization. 
    await init();

    const isEnabled = unleash.isEnabled('simpleFlag')

    return {
        statusCode: 200,
        body: {message: `Feature flag 'simpleFlag' is ${isEnabled ? 'enabled' : 'disabled'}`},
    };
};
```

In our Lambda  setup we have enabled a [public function URL](https://docs.aws.amazon.com/lambda/latest/dg/lambda-urls.html), which allows us to trigger the function easily via the public URL of the function. 

Example:

```bash
curl https://z5w5lkzlsozutfhaixbjsj27cm0dhnfh.lambda-url.eu-north-1.on.aws   

{"message":"Feature flag 'simpleFlag' is enabled"}
```

## Conclusion

Mastering feature flags in serverless? This guide demonstrated the surprisingly simple use of Unleash SDK. Remember, avoid initializing the SDK multiple times within your serverless function for smooth operation. 

If you plan to have thousands of RPS towards your lambda you should consider [Unleash Edge](https://docs.getunleash.io/understanding-unleash/proxy-hosting), a component built to scale your usage of Unleash. 


:::note Lambda latency

If you care about latency and particularly faster cold starts you should take a look at [Low Latency Runtime](https://github.com/awslabs/llrt) (LTR) an experimental, lightweight JavaScript runtime designed to address the growing demand for fast and efficient Serverless applications. The team behind Unleash is super excited about this initiative. 

:::