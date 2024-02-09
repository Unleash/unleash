---
title: 2. Never expose PII. Follow the principle of least privilege.
---

import Figure from '@site/src/components/Figure/Figure.tsx'

To keep things simple, you may be tempted to evaluate the feature flags in your Feature Flag Control Service. Don’t. Your Feature Flag Control Service should only handle the configuration for your feature flags and pass this configuration down to SDKs connecting from your applications.

The primary rationale behind this practice is that feature flags often require contextual data for accurate evaluation. This may include user IDs, email addresses, or geographical locations that influence whether a flag should be toggled on or off. Safeguarding this sensitive information from external exposure is paramount. This information may include Personally Identifiable Information (PII), which must  remain confined within the boundaries of your application, following the data security principle of least privilege (PoLP).

<Figure caption="Evaluation happens inside the server-side application, where you have all the contextual application data. The flag configuration (how to evaluate the flags) is fetched from the feature flagging control service." img="/img/feature-flag-server-side-evaluation.png"/>

For client-side applications where the code resides on the user's machine, such as in the browser or on mobile devices, you’ll want to take a different approach. You can’t evaluate on the client side because it raises significant security concerns by exposing potentially sensitive information such as API keys, flag data, and flag configurations. Placing these critical elements on the client side increases the risk of unauthorized access, tampering, or data breaches.

Instead of performing client-side evaluation, a more secure and maintainable approach is to conduct feature flag evaluation within a self-hosted environment. Doing so can safeguard sensitive elements like API keys and flag configurations from potential client-side exposure. This strategy involves a server-side evaluation of feature flags, where the server makes decisions based on user and application parameters and then securely passes down the evaluated results to the frontend without any configuration leaking.

<Figure caption="In client-side setups, perform the feature flag evaluation on the server side. Connected client-side applications receive only evaluated feature flags to avoid leaking configuration." img="/img/feature-flag-architecture-client-side.png"/>

Here’s how you can architect your solution to minimize PII or configuration leakage:

1. **Server-Side Components**:

In Principle 1, we proposed a set of architectural principles and components to set up a Feature Flag Control Service. The same architecture patterns apply here, with additional suggestions for achieving local evaluation. Refer to Principle 1 for patterns to set up a feature flagging service.

**Feature Flag Evaluation Service**: If you need to use feature flags on the client side, where code is delivered to users' devices, you’ll need an evaluation server that can evaluate feature flags and pass evaluated results down to the SDK in the client application.

2. **SDKs**:

SDKs will make it more comfortable to work with feature flags. Depending on the context of your infrastructure, you need different types of SDKs to talk to your feature flagging service. For the server side, you’ll need SDKs that can talk directly to the feature flagging service and fetch the configuration.

The server-side SDKs should implement logic to evaluate feature flags based on the configuration received from the Feature Flag Control Service and the application-specific context. Local evaluation ensures that decisions are made quickly without relying on network roundtrips.

For client-side feature flags, you’ll need a different type of SDK. These SDKs will send the context to the Feature Flag Evaluation Service and receive the evaluated results. These results should be stored in memory and used when doing a feature flag lookup in the client-side application. By keeping the evaluated results for a specific context in memory in the client-side application, you avoid network roundtrips every time your application needs to check the status of a feature flag. It achieves the same level of performance as a server-side SDK, but the content stored in memory is different and limited to evaluated results on the client.

The benefits of this approach include:

 **Privacy Protection**:

   a. **Data Minimization**: By evaluating feature flags in this way, you minimize the amount of data that needs to be sent to the Feature Flag Control Service. This can be crucial for protecting user privacy, as less user-specific data is transmitted over the network.

   b. **Reduced Data Exposure**:  Sensitive information about your users or application's behavior is less likely to be exposed to potential security threats. Data breaches or leaks can be mitigated by limiting the transmission of sensitive data.
