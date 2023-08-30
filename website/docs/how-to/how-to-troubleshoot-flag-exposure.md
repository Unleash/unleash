---
title: My feature flag is enabled but all/some of our users are not exposed to it
---

To confirm how users will have flags resolved, follow these steps:
1. The Unleash Playground was developed with this particular use case in mind. An access token can be used along with context values (passed in via the UI) to see how a flag will be resolved. Check our [Unleash Playground documentation](../reference/playground.mdx) for more info. 
2. When using a **gradual rollout** strategy, be mindful of the **"stickiness"** value. The stickiness value is a context value used when determining where a context will fall in a gradual rollout. It is a **required field** for the strategy; satisfying the constraints and strategy requirements alone (without the stickiness value) will result in the strategy not being satisfied causing the Unleash platform to defer to other strategies (if possible) or as a disabled state if no other strategies are satisfied.
    - Sometimes, different implementations of a feature (for example, front-end and back-end) may be unable to provide the same information or define the information differently leading to different outcomes from the platform.
3. If using the Unleash Edge or Proxy, consider changing the API endpoint being used by the SDK instance. The SDK and platform may be configured correctly while the intermediary (Edge or Proxy) is somehow malfunctioning. 
