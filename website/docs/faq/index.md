---
title: Frequently asked questions
slug: /faq
---

## How do I enable a feature only for a select group of users, such as people that work at a specific store?

Use the standard strategy and use a strat constraint that says the user must have custom field X with value Y.

Optionally, for non-enterprise, use a custom strategy.

## What's `UNLEASH_PROXY_SECRETS` and `clientKey`

...

## Does pricing depend on MAU? Is there a cap?

No!

## Does Unleash hosted do any rate limiting?

...nnnnooo?


## Performance; Caching. Is there a built in client-side cache, or would each consumer have to implement it individually?

Yes there is a built-in client-side cache. SDKs will store the last known state of feature toggles if connectivity to proxy/unleash is interrupted. Further - we have implemented bootstrap functionality to the java SDK and plan to release this functionality to all SDKs in the future. More information on this can be found here https://github.com/unleash/unleash-proxy-client-js#bootstrap.

## Are client side API calls synchronous/blocking?

All of our SDKs will perform all synchronization with the API in the background. This means that a call to isEnabled or getVariant will only work on data available in memory... Each SDKs varies a bit. E.g. the Java SDK will utilize one background thread to perform all communication with the Unleash API, while the Node.js SDK will use a non-blocking HTTP call in the background at given intervals.

## Where is the data physically processed and stored?

Unleash is built with privacy in mind and by design operates inside your application via SDK initialization - this keeps your data in your hands and out of ours. You control what data is sent to your unleash instance. We are currently established in mainly in eu-central-1 and us-east-1 and we consider new regions.

## What security compliance certification(s) does the vendor have obtained?

SOC2 type-1, expected to be done in December 2021.
We will immedetly move in to SOC2-type-2, but this requires us to be monitored over a period of 6 months.

## Does the application validate the input data and the output data (e.g. to prevent buffer overflow, SQL Injection etc.)?

Unleash API performs input validation.
Unleash uses parameterized sql builders to protect against SQL injections.
Unleash Admin UI uses escaping to protect against XSS injection.
