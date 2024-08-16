---
title: "Feature flags: Best practices for building and scaling"
description: "Discover 11 essential principles for building robust, large-scale feature flag systems."
toc_max_heading_level: 2
---

import Figure from '@site/src/components/Figure/Figure.tsx'

Feature flags, sometimes called feature toggles or feature switches, are a powerful software development technique that allows engineering teams to decouple the release of new functionality from software deployments. 

With feature flags, developers can turn specific features or code segments on or off at runtime without needing a code deployment or rollback. Organizations that adopt feature flags see improvements in key DevOps metrics like lead time, deployment frequency, change failure rate, and recovery time.

At Unleash, we've defined 11 principles for building a large-scale feature flag system. These principles have their roots in distributed systems design and focus on security, privacy, and scalability—critical needs for enterprise systems. By following these principles, you can create a feature flag system that’s reliable, easy to maintain, and capable of handling heavy loads.

These principles are:

1. [Enable runtime control: Control flags dynamically instead of through config files.](#1-enable-runtime-control)
2. [Never expose PII: Follow the principle of least privilege.](https://docs.getunleash.io/topics/feature-flags/feature-flag-best-practices)
3. [Reduce latency: Evaluate flags as close to the user as possible.](https://docs.getunleash.io/topics/feature-flags/feature-flag-best-practices)
4. [Scale horizontally: Decouple read and write operations.](https://docs.getunleash.io/topics/feature-flags/feature-flag-best-practices)
5. [Limit payload size: Keep feature flag payload lean.](https://docs.getunleash.io/topics/feature-flags/feature-flag-best-practices)
6. [Design for failure: Prioritize availability over consistency.](https://docs.getunleash.io/topics/feature-flags/feature-flag-best-practices)
7. [Use short-lived flags: Do not confuse flags with application configuration.](https://docs.getunleash.io/topics/feature-flags/feature-flag-best-practices)
8. [Use unique flag names: Enforce naming conventions.](https://docs.getunleash.io/topics/feature-flags/feature-flag-best-practices)
9. [Choose open by default: Democratize feature flag access.](https://docs.getunleash.io/topics/feature-flags/feature-flag-best-practices)
10. [Do no harm: Prioritize consistent user experience.](https://docs.getunleash.io/topics/feature-flags/feature-flag-best-practices)
11. [Enable traceability: Make flag evaluation transparent and testable.](https://docs.getunleash.io/topics/feature-flags/feature-flag-best-practices)

Let’s dive deeper into each principle.


## 1. Enable runtime control

A scalable feature management system evaluates flags at runtime. Flags are dynamic, not static. If you need to restart your application to turn on a flag, that's configuration, not a feature flag.

A large-scale feature flag system that enables runtime control should have, at minimum, the following components: a service to manage feature flags, a database or data store, an API layer, a feature flag SDK, and a continuous update mechanism.

Let's break down these components.

- **Feature Flag Control Service**: A service that acts as the control plane for your feature flags, managing all flag configurations. The scope of this service should reflect the boundaries of your organization.
- **Database or data store**: A robust, scalable, and highly available database or data store that stores feature flag configurations reliably. Common options include SQL databases, NoSQL databases, or key-value stores.
- **API layer**: An API layer that exposes endpoints for your application to interact with the _Feature Flag Control Service_. This API should allow your application to request feature flag configurations.
- **Feature flag SDK**: An easy-to-use interface for fetching flag configurations and evaluating feature flags at runtime. When considering feature flags in your application, the call to the SDK should query the local cache, and the SDK should ask the central service for updates in the background.
- **Continuous update mechanism**: An update mechanism that enables dynamic updates to feature flag configurations without requiring application restarts or redeployments. The SDK should handle subscriptions or polling to the _Feature Flag Control Service_ for updates.

<Figure caption="The SDK holds an in-memory feature flag configuration cache which is continuously synced with the Feature Flag Control Service. You can then use the SDK to check the state of feature flags in your application." img="/img/feature-flag-scalable-architecture.png"/>

## 2. Never expose PII

Feature flags often require contextual data for accurate evaluation, which could include sensitive information such as user IDs, email addresses, or geographical locations. To safeguard this data, follow the data security [principle of least privilege (PoLP)](https://www.cyberark.com/what-is/least-privilege), ensuring that all [Personally Identifiable Information (PII)](https://www.investopedia.com/terms/p/personally-identifiable-information-pii.asp) remains confined to your application.

To implement the principle of least privilege, ensure that your _Feature Flag Control Service_ only handles the configuration for your feature flags and passes this configuration down to the SDKs connecting from your applications. 

Let's look at an example where feature flag evaluation happens inside the server-side application. This is where all the contextual application data lives. The flag configuration—all the information needed to evaluate the flags—is fetched from the _Feature Flag Control Service_.

<Figure caption="Evaluating flags on the server side without exposing sensitive information." img="/img/feature-flag-server-side-evaluation.png"/>

Client-side applications where the code resides on the user's machine in browsers or mobile devices, require a different approach. You can’t evaluate flags on the client side because it raises significant security concerns by exposing potentially sensitive information such as API keys, flag data, and flag configurations. Placing these critical elements on the client side increases the risk of unauthorized access, tampering, or data breaches.

Instead of performing client-side evaluation, a more secure and maintainable approach is to evaluate feature flags within a self-hosted environment. Doing so can safeguard sensitive elements like API keys and flag configurations from potential client-side exposure. This strategy involves a server-side evaluation of feature flags, where the server makes decisions based on user and application parameters and then securely passes down the evaluated results to the frontend without any configuration leaking.

<Figure caption="In client-side setups, perform the feature flag evaluation on the server side. Connected client-side applications receive only evaluated feature flags to avoid leaking configuration." img="/img/feature-flag-architecture-client-side.png"/>

Here’s how you can architect your solution to avoid PII or configuration leakage:

### Server-side components

In [Principle 1](#1-enable-runtime-control), we proposed a set of architectural components for building a feature flag system. The same principles apply here, with additional suggestions for achieving local evaluation. For client-side setups, use a dedicated evaluation server that can evaluate feature flags and pass evaluated results to the SDK in the client application.

### SDKs

[SDKs](/reference/sdks) make it more comfortable to work with feature flags. Depending on the context of your infrastructure, you need different types of SDKs to talk to your feature flagging service. Server-side SDKs should fetch configurations from the _Feature Flag Control Service_ and evaluate flags locally using the application’s context, reducing the need for frequent network calls.

For client-side feature flags, you’ll need a different type of SDK. These SDKs will send the context to the evaluation server and receive the evaluated results. The evaluated results are then cached in memory in the client-side application, allowing quick lookups without additional network overhead. This provides the performance benefits of local evaluation while minimizing the exposure of sensitive data.

This approach enhances privacy by minimizing the amount of sensitive data sent to the _Feature Flag Control Service_, reducing the risk of data exposure and potential security threats. By limiting data transmission, you protect sensitive information and mitigate the impact of potential breaches.

## 3. Evaluate flags as close to the user as possible

For optimal performance, you should evaluate feature flags as close to your users as possible. Building on the server-side evaluation approach from [Principle 2](#2-never-expose-pii), let's look at how evaluating flags close to your users can bring key benefits in terms of performance, cost, and reliability:

- **Reduced latency**: Network roundtrips introduce latency, slowing your application's response time. Local evaluation eliminates the need for these roundtrips, resulting in faster feature flag decisions. This makes your application more responsive thereby improving the user experience.
- **Offline functionality**: Many applications need to function offline or in low-connectivity environments. Local evaluation ensures feature flags are still functional, even without an active network connection. This is especially important for mobile apps or services in remote locations.
- **Reduced bandwidth costs**: Local evaluation reduces the amount of data transferred between your application and the feature flag service. This can lead to significant cost savings, particularly if you have a large user base or high traffic volume.
- **Ease of development and testing**: Developers can continue their work in environments where a network connection to the feature flag service might be unstable or unavailable. Local evaluation allows teams to work on feature flag-related code without needing constant access to the service, streamlining the development process.
- **Resilience during service downtime**: If the feature flag service experiences downtime or outages, local evaluation allows your application to continue functioning without interruptions. This is important for maintaining service reliability and ensuring your application remains available even when the service is down.

In summary, this principle emphasizes optimizing performance while protecting end-user privacy by evaluating feature flags as close to the end user as possible. This also leads to a highly available feature flag system that scales with your applications.

## 4. Scale horizontally

When designing a scalable feature flag system, one of the most effective strategies is to separate read and write operations into distinct APIs. This architectural decision not only allows you to scale each component independently but also provides better performance, reliability, and control.

<Figure caption="Separating reading and writing of the database allows you to horizontally scale out the read APIs without scaling the write APIs." img="/img/feature-flag-horizontal-scaling.png"/>

By decoupling read and write operations, you gain the flexibility to scale horizontally based on the unique demands of your application. For example, if read traffic increases, you can add more servers or containers to handle the load without needing to scale the write operations. The benefits of decoupling read and write operations extend beyond just scalability; let's look at a few others:
- **More efficient caching**: You can optimize your flag caching for read operations to reduce latency while keeping write operations consistent.
- **Granular access control**: You can apply different security measures and access controls to the two APIs, reducing the risk of accidental or unauthorized changes.
- **Improved monitoring and troubleshooting**: Monitoring and troubleshooting becomes more straightforward. It's easier to track and analyze the performance of each API independently. When issues arise, you can isolate the source of the problem more quickly and apply targeted fixes or optimizations.
- **Flexibility and maintenance**: Updates to one API won't directly impact the other, reducing the risk of unintended consequences. This separation of concerns allows development teams to work on each API separately, facilitating parallel development and deployment cycles.
- **Distributed traffic**: You can tailor load balancing strategies to the specific needs of the read and write APIs. You can distribute traffic and resources accordingly to optimize performance and ensure that neither API becomes a bottleneck under heavy load.

## 5. Limit payload size

Minimizing the size of feature flag payloads is a critical aspect of maintaining the efficiency and performance of a feature flag system. The configuration of your feature flags can vary in size depending on the complexity of your targeting rules. Keeping the payload as small as possible results in:

- **Reduced network load**: Large payloads can lead to increased network traffic between the application and the feature flagging service. This can overwhelm the network and cause bottlenecks, leading to slow response times and degraded system performance. Even small optimizations can make a big difference at scale.
- **Faster flag evaluation**: Smaller payloads mean faster data transmission and flag evaluation, crucial for real-time decisions that affect user experience.
- **Improved memory efficiency**: Feature flagging systems often store flag configurations in memory for quick access during runtime. Larger payloads consume more memory, potentially causing memory exhaustion and system crashes. Limiting payloads ensures that the system remains memory-efficient, reducing the risk of resource-related issues.
- **Better scalability**: Smaller payloads require fewer resources, making it easier to scale your system as your application grows
- **Lower infrastructure costs**: Optimized payloads reduce infrastructure needs and costs while simplifying system management.
- **Improved system reliability**: Delivering smaller, more manageable payloads minimizes the risk of network timeouts and failures.
- **Ease of monitoring and debugging**: Smaller payloads are easier to monitor and debug, making issue resolution faster.

## 6. Design for failure

Your feature flag system should not be able to take down your main application under any circumstance, even during network disruptions. Implement these strategies to ensure fault tolerance for your feature flag system.

Your application's availability should have zero dependencies on the availability of your feature flag system. Avoid real-time flag evaluations; if the feature flag system goes down, your application should remain unaffected without experiencing downtime or degraded performance.

If the feature flag system fails, your application should continue running smoothly. Feature flagging should degrade gracefully, ensuring users don’t encounter unexpected behavior or disruptions.

You can implement the following strategies to achieve a resilient architecture:

- **Bootstrap SDKs with data**: Feature flagging SDKs should work with locally cached data, even when the network connection to the _Feature Flag Control Service_ is unavailable, using the last known configuration or defaults to ensure uninterrupted functionality.
- **Use local cache**: Maintaining a local cache of feature flag configuration helps reduce network round trips and dependency on external services. The local cache can periodically synchronize with the central _Feature Flag Control Service_ when it's available. This approach minimizes the impact of network failures or service downtime on your application.
- **Evaluate feature flags locally**: Whenever possible, the SDKs or application components should evaluate feature flags locally without relying on external services, ensuring uninterrupted feature flag evaluations even if the feature flagging service is down.
- **Prioritize availability over consistency**: In line with the [CAP theorem](https://www.ibm.com/topics/cap-theorem), design for availability over strict consistency. In the face of network partitions or downtime of external services, your application should favor maintaining its availability rather than enforcing perfectly consistent feature flag configuration caches. Eventually consistent systems can tolerate temporary inconsistencies in flag evaluations without compromising availability.

## 7. Make feature flags short-lived

The most common use case for feature flags is to manage the rollout of new functionality. Once a rollout is complete, you should remove the feature flag from your code and archive it. Remove any old code paths that the new functionality replaces.

Avoid using feature flags for static application configuration. Application configuration should be consistent, long-lived, and loaded during application startup. In contrast, feature flags are intended to be short-lived, dynamic, and updated at runtime. They prioritize availability over consistency and are designed to be modified frequently.

To succeed with feature flags in a large organization, follow these strategies:

- **Set flag expiration dates**: Assign expiration dates to feature flags to track which flags are no longer needed. A good feature flag management tool will alert you to expired flags, making it easier to maintain your codebase.
- **Treat feature flags like technical debt**: Incorporate tasks to remove outdated feature flags into your sprint or project planning, just as you would with technical debt. Feature flags add complexity to your code by introducing multiple code paths that need context and maintenance. If you don’t clean up feature flags in a timely manner, you risk losing the context as time passes or personnel changes, making them harder to manage or remove.
- **Archive old flags**: When feature flags are no longer in use, archive them after removing them from the codebase. This archive serves as an important audit log of feature flags and allows you to revive flags if you need to install an older version of your application.

While most feature flags should be short-lived, there are valid exceptions for long-lived flags, including:
- **Kill switches**: These act as inverted feature flags, allowing you to gracefully disable parts of a system with known weak spots.
- **Internal flags**: Used to enable additional debugging, tracing, and metrics at runtime, which are too costly to run continuously. Engineers can enable these flags while debugging issues.

## 8. Use unique flag names

Ensure that all flags within the same _Feature Flag Control Service_ have unique names across your entire system. Unique naming prevents the reuse of old flag names, reducing the risk of accidentally re-enabling outdated features with the same name.

Unique naming has the following advantages:
- **Flexibility over time**: Large enterprise systems are not static. Monoliths may split into microservices, microservices may merge, and applications change responsibility. Unique flag naming across your organization means that you can reorganize your flags to match the changing needs of your organization.
- **Fewer conflicts**: If two applications use the same feature flag name, it can become difficult to identify which flag controls which application. Even with separate namespaces, you risk toggling the wrong flag, leading to unexpected consequences.
- **Easier flag management**: Unique names make it simpler to track and identify feature flags. Searching across codebases becomes more straightforward, and it’s easier to understand a flag’s purpose and where it’s used.
- **Improved collaboration**: A feature flag with a unique name in the organization simplifies collaboration across teams, products, and applications, ensuring that everyone refers to the same feature.

## 9. Chose open by default

At Unleash, we believe in democratizing feature flag access. Making feature flag systems open by default enables engineers, product owners, and support teams to collaborate effectively and make informed decisions. Open access encourages productive discussions about feature releases, experiments, and their impact on the user experience.

Access control and visibility are also key considerations for security and compliance. Tracking and auditing feature flag changes help maintain data integrity and meet regulatory requirements. While open access is key, it’s equally important to integrate with corporate access controls, such as SSO, to ensure security. In some cases, additional controls like feature flag approvals using the [four-eyes principle](/reference/change-requests) are necessary for critical changes.

Consider providing the following:
- **Access to the codebase**: Engineers need direct access to the codebase where feature flags are implemented. This allows them to quickly diagnose and fix issues, minimizing downtime and performance problems.
- **Access to configuration**: Engineers, product owners, and even technical support should be able to view the feature flag configuration. This transparency provides insights into which features are currently active, what conditions trigger them, and how they impact the application's behavior. Product owners can also make real-time decisions on feature rollouts or adjustments without relying solely on engineering resources.
- **Access to analytics**: Both engineers and product owners should be able to correlate feature flag changes with production metrics. This helps assess how flags impact user behavior, performance, and system health, enabling data-driven decisions for feature rollouts, optimizations, or rollbacks.

## 10. Prioritize consistent user experience

Feature flagging solutions are indispensable tools in modern software development, enabling teams to manage feature releases and experiment with new functionality. However, one aspect that is absolutely non-negotiable in any feature flag solution is the need to ensure a consistent user experience. Feature flagging solutions must prioritize consistency and guarantee the same user experience every time, especially with percentage-based gradual rollouts.

Strategies for consistency in percentage-based gradual rollouts:

- **User hashing**: Assign users to consistent groups using a secure hashing algorithm based on unique identifiers like user IDs or emails. This ensures that the same user consistently falls into the same group.
- **Segmentation control**: Provide controls within the feature flagging tool to allow developers to [segment](/reference/segments) users logically by criteria like location, subscription type, or other relevant factors, ensuring similar experiences for users within the same segment.
- **Fallback mechanisms**: Include fallback mechanisms in your architecture. If a user encounters issues or inconsistencies, the system should automatically switch them to a stable version or feature state.
- **Logging and monitoring**: Implement robust logging and monitoring. Continuously track which users are in which groups and what version of the feature they are experiencing. Monitor for anomalies or deviations and consider building automated processes to disable features that may be misbehaving.
- **Transparent communication**: Clearly communicate gradual rollouts through in-app notifications, tooltips, or changelogs, so users are informed about changes and know what to expect.

## 11. Enable traceability and transparency

[Developer experience](https://www.opslevel.com/resources/devex-series-part-1-what-is-devex) is a critical factor to consider when implementing a feature flag solution. A positive developer experience enhances the efficiency of the development process and contributes to the overall success and effectiveness of feature flagging. One key aspect of developer experience is ensuring the testability of the SDK and providing tools for developers to understand how and why feature flags are evaluated.

To ensure a good developer experience, you should provide the following:
- **Simplified testing and debugging**: A testable SDK enables developers to quickly test and iterate on features, speeding up development cycles. Developers can toggle flags, simulate conditions, and observe results without significant code changes or redeployments. This makes it easier to identify and fix issues by examining flag configurations and logging decisions.
- **Visibility into flag behavior**: Developers need tools to understand how feature flags impact the user experience. Visibility into flag behavior helps them assess changes, debug effectively with multiple inputs, and collaborate more easily within cross-functional teams.
- **Effective monitoring**: A testable SDK should support real-time monitoring of flag performance, tracking metrics like evaluations, user engagement, and feature impact. Developers can use this data to evaluate the success of new features, conduct A/B tests, and make informed decisions about optimizations.
- **Usage metrics**: Provide aggregated insights into feature flag usage, helping developers confirm that everything is working as expected.
- **Documentation and training**: Offer clear, comprehensive documentation for the API, UI, and SDKs, with easy-to-follow examples. This simplifies onboarding for new developers and supports continuous training, ensuring effective use of the feature flagging system.