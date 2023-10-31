---
title: My feature flag is enabled but all/some of our users are not exposed to it
---

To confirm how users will have flags resolved, follow these steps:
1. Ensure your application is waiting for the `ready` event: It could be that frontend clients are calling `isEnabled('feature-flag')` before they have the response from the server. In this case, you should defer isEnabled calls until the client has emitted the `ready` event.
2. The [Unleash Playground](/reference/playground.mdx) was developed with this particular use case in mind. An access token can be used along with context values (passed in via the UI) to see how a flag will be resolved. 
3. When using a **gradual rollout** strategy, be mindful of the **[stickiness](/reference/stickiness)** value. When evaluating a flag, if the provided context does not include the field used in the stickiness configuration, the gradual rollout strategy will be evaluated to `false`.
