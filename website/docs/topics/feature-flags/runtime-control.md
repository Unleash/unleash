---
title: 1. Enable run-time control. Control flags dynamically, not using config files.
---

import Figure from '@site/src/components/Figure/Figure.tsx'

A scalable feature management system evaluates flags at runtime. Flags are dynamic, not static. If you need to restart your application to turn on a flag, you are using configuration, not feature flags.

A large-scale feature flag system that enables runtime control should have at minimum the following components:

**1. Feature Flag Control Service**: Use a centralized feature flag service that acts as the control plane for your feature flags. This service will handle flag configuration. The scope of this service should reflect the boundaries of your organization.

Independent business units or product lines should potentially have their own instances, while business units or product lines that work closely together should most likely use the same instance in order to facilitate collaboration. This will always be a contextual decision based on your organization and how you organize the work, but keep in mind that you’d like to keep the management of the flags as simple as possible to avoid the complexity of cross-instance synchronization of feature flag configuration.

**2. Database or Data Store**: Use a robust and scalable database or data store to store feature flag configurations. Popular choices include SQL or NoSQL databases or key-value stores. Ensure that this store is highly available and reliable.

**3. API Layer**: Develop an API layer that exposes endpoints for your application to interact with the Feature Flag Control Service. This API should allow your application to request feature flag configurations.

**4. Feature Flag SDK**: Build or integrate a feature flag SDK into your application. This SDK should provide an easy-to-use interface for fetching flag configurations and evaluating feature flags at runtime. When evaluating feature flags in your application, the call to the SDK should query the local cache, and the SDK should ask the central service for updates in the background.

Build SDK bindings for each relevant language in your organization. Make sure that the SDKs uphold a standard contract governed by a set of feature flag client specifications that documents what functionality each SDK should support.

<Figure caption="The SDK holds an in-memory feature flag configuration cache which is continuously synced with the feature flag control service. The SDK can then be used to check the state of feature flags in your application." img="/img/feature-flag-scalable-architecture.png"/>

**5. Continuously Updated**: Implement update mechanisms in your application so that changes to feature flag configurations are reflected without requiring application restarts or redeployments. The SDK should handle subscriptions or polling to the feature flag service for updates.
