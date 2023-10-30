---
title: My feature flag is enabled but all/some of our users are not exposed to it
---

To confirm how users will have flags resolved, follow these steps:
1. The [Unleash Playground](/reference/playground.mdx) was developed with this particular use case in mind. An access token can be used along with context values (passed in via the UI) to see how a flag will be resolved. 
2. When using a **gradual rollout** strategy, be mindful of the **[stickiness](/reference/stickiness)** value. When evaluating a flag, if the provided context does not include the field used in the stickiness configuration, the gradual rollout strategy will be evaluated to `false`.
