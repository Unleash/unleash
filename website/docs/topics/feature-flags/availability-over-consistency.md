---
title: 6. Design for failure. Favor availability over consistency.
---

Your feature flag system should not be able to take down your main application under any circumstance, including network disruptions. Follow these patterns to achieve fault tolerance for your feature flag system.

**Zero dependencies**: Your application's availability should have zero dependencies on the availability of your feature flag system. Robust feature flag systems avoid relying on real-time flag evaluations because the unavailability of the feature flag system will cause application downtime, outages, degraded performance, or even a complete failure of your application.

 **Graceful degradation**: If the system goes down, it should not disrupt the user experience or cause unexpected behavior. Feature flagging should gracefully degrade in the absence of the Feature Flag Control service, ensuring that users can continue to use the application without disruption.

**Resilient Architecture Patterns**:

   - **Bootstrapping SDKs with Data**: Feature flagging SDKs used within your application should be designed to work with locally cached data, even when the network connection to the Feature Flag Control service is unavailable. The SDKs can bootstrap with the last known feature flag configuration or default values to ensure uninterrupted functionality.

   - **Local Cache**: Maintaining a local cache of feature flag configuration helps reduce network round trips and dependency on external services. The local cache can be periodically synchronized with the central Feature Flag Control service when it's available. This approach minimizes the impact of network failures or service downtime on your application.

   - **Evaluate Locally**: Whenever possible, the SDKs or application components should be able to evaluate feature flags locally without relying on external services. This ensures that feature flag evaluations continue even when the feature flagging service is temporarily unavailable.

   - **Availability Over Consistency**: As the CAP theorem teaches us, in distributed systems, prioritizing availability over strict consistency can be a crucial design choice. This means that, in the face of network partitions or downtime of external services, your application should favor maintaining its availability rather than enforcing perfectly consistent feature flag configuration caches. Eventually consistent systems can tolerate temporary inconsistencies in flag evaluations without compromising availability. In CAP theorem parlance, a feature flagging system should aim for AP over CP.

By implementing these resilient architecture patterns, your feature flagging system can continue to function effectively even in the presence of downtime or network disruptions in the feature flagging service. This ensures that your main application remains stable, available, and resilient to potential issues in the feature flagging infrastructure, ultimately leading to a better user experience and improved reliability.
