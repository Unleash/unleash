---
title: My feature flag is returning unexpected results in my A/B/n test
---

Occasionally, users might come across a situation where a feature flag is returning unexpected results when running an A/B/n test.

The first thing to look into is your feature configuration.

If you're unsure whether the feature flag is being properly returned, you can go through the steps in this troubleshooting guide before proceeding: [My feature flag is not returned in the Frontend API/Edge/Proxy](/using-unleash/troubleshooting/flag-not-returned.md).

1. If you're using a [gradual rollout activation strategy](/reference/activation-strategies#gradual-rollout) be sure to set the rollout percentage to the percentage of your user base you would like to target for the test. If you would like to target 100% of your user base on your A/B/n test, confirm that your rollout percentage is set to 100%. Alternatively, you may want to consider using a [standard strategy](/reference/activation-strategies#standard) instead, since that means "active for everyone". This adjustment guarantees that all users participate in the A/B/n test, irrespective of the division ratio, be it an even 50-50 split, for a typical A/B test with 50% for Group A and 50% for Group B, or any other distribution that you configure in your variants.
2. When using a [gradual rollout strategy](/reference/activation-strategies#gradual-rollout), be mindful of the [stickiness](/reference/stickiness) value. If you're using default stickiness, confirm that either `userId` or `sessionId` are part of your context to ensure consistent results. Besides, if the provided context does not include the field used in the stickiness configuration, the gradual rollout strategy will be evaluated to `false` and therefore it will not be returned by the API.
3. Ensure that your variants are correctly configured. You can refer to [feature flag variants](/reference/feature-toggle-variants). For example, if you would like to run a simple 50-50 A/B test, then your variants should look similar to this: 

![An example of variants configured for an A/B test](/img/troubleshooting-flag-abn-test-unexpected-result-variants.png)

4. Double check that your code is correctly handling the feature flag variant response. You can refer to your SDK documentation for more information on how to handle feature flag variants. For example, if you're using the [Unleash React SDK](/reference/sdks/react), you can follow the [check variants](/reference/sdks/react#check-variants) section of the documentation. Given the example variants above, this could look like the following:

```tsx
import { useVariant } from '@unleash/proxy-client-react';

export const TestComponent = () => {
  const variant = useVariant('ab-test-flag');

  if (variant.name === 'A') {
    return <AComponent />;
  } else if (variant.name === 'B') {
    return <BComponent />;
  }
  return <DefaultComponent />;
};
```

Feature activation strategies can be combined in different ways, which may lead to complex scenarios. If you're still not seeing the results you expect, try using the [Playground](/reference/playground.mdx) to verify that the feature is properly configured and responding as expected.
