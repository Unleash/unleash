---
title: 3. Evaluate flags as close to the user as possible. Reduce latency.
---

Feature flags should be evaluated as close to your users as possible, and the evaluation should always happen server side as discussed in Principle 2. In addition to security and privacy benefits, performing evaluation as close as possible to your users has multiple benefits:

1. **Performance Efficiency**:

   a. **Reduced Latency**: Network roundtrips introduce latency, which can slow down your application's response time. Local evaluation eliminates the need for these roundtrips, resulting in faster feature flag decisions. Users will experience a more responsive application, which can be critical for maintaining a positive user experience.

   b. **Offline Functionality**: Applications often need to function offline or in low-connectivity environments. Local evaluation ensures that feature flags can still be used and decisions can be made without relying on a network connection. This is especially important for mobile apps or services in remote locations.

2. **Cost Savings**:

   a. **Reduced Bandwidth Costs**: Local evaluation reduces the amount of data transferred between your application and the feature flag service. This can lead to significant cost savings, particularly if you have a large user base or high traffic volume.

3. **Offline Development and Testing**:

   a. **Development and Testing**: Local evaluation is crucial for local development and testing environments where a network connection to the feature flag service might not be readily available. Developers can work on feature flag-related code without needing constant access to the service, streamlining the development process.

4. **Resilience**:

   a. **Service Outages**: If the feature flag service experiences downtime or outages, local evaluation allows your application to continue functioning without interruptions. This is important for maintaining service reliability and ensuring your application remains available even when the service is down.

In summary, this principle emphasizes the importance of optimizing performance while protecting end-user privacy by evaluating feature flags as close to the end user as possible. Done right, this also leads to a highly available feature flag system that scales with your applications.
