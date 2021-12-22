---
id: stickiness
title: Stickiness
---

_Stickiness_ is how Unleash guarantees that the same user gets the same features every time. Stickiness is useful in any scenario where you want to either show a feature to only a subset of users or give users a variant of a feature.

## Calculation

By default, Unleash calculates stickiness based on the user id and the group id. If the user id is unavailable, it falls back to using the session id instead. It hashes these values to a number between 0 and 100 using the [MurmurHash hash function](https://en.wikipedia.org/wiki/MurmurHash). This number is what determines whether a user will see a specific feature or variant. Because the process is deterministic, the same user will always get the same number.

If both the user id and the session id is unavailable, the calculation returns a random value and stickiness is not guaranteed.

## Consistency

Because the number assigned to a user won't change, Unleash also guarantees that the a user will keep seeing the same features even if certain other parameters change.

For instance: When using the [gradual rollout activation strategy](../user_guide/activation-strategies.md#gradual-rollout), any user whose number is less than or equal to the rollout percentage will see the feature. This means that the same users will keep seeing the feature even as you increase the percentage of your user base that sees the feature.

## Custom stickiness (beta) {#custom-stickiness}

:::info
Custom stickiness is available starting from Unleash Enterprise v4.
:::

When using [the gradual rollout strategy](../user_guide/activation-strategies.md#gradual-rollout) or [feature toggle variants](./feature-toggle-variants.md), you can use parameters other than the user id to calculate stickiness. More specifically, you can use any field, custom or otherwise, of the [Unleash Context](../user_guide/unleash-context.md) as long as you have enabled custom stickiness for these fields.

:::note
This feature is currently in beta and is not yet supported by all our SDKs. Check out the [SDK compatibility table](../sdks/index.md#server-side-sdk-compatibility-table) to see what SDKs support it at the moment.
:::

### Enabling custom stickiness

To enable custom stickiness on a field, navigate to the Create Context screen in the UI and find the field you want to enable. There's a "Custom stickiness" option at the bottom of the form. Enable this toggle and update the context field by pressing the "Update" button.

![The Create Context screen in the Unleash UI. There's a toggle at the bottom to control custom stickiness.](/img/enable_custom_stickiness.png)
