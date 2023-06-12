---
title: Stickiness
---

_Stickiness_ is how Unleash guarantees that the same user gets the same features every time. Stickiness is useful in any scenario where you want to either show a feature to only a subset of users or give users a variant of a feature.

## Calculation

By default, Unleash calculates stickiness based on the user id and the group id. If the user id is unavailable, it falls back to using the session id instead. It hashes these values to a number between 0 and 100 using the [MurmurHash hash function](https://en.wikipedia.org/wiki/MurmurHash). This number is what determines whether a user will see a specific feature or variant. Because the process is deterministic, the same user will always get the same number.

If both the user id and the session id is unavailable, the calculation returns a random value and stickiness is not guaranteed.

## Consistency

Because the number assigned to a user won't change, Unleash also guarantees that the a user will keep seeing the same features even if certain other parameters change.

For instance: When using the [gradual rollout activation strategy](../reference/activation-strategies.md#gradual-rollout), any user whose number is less than or equal to the rollout percentage will see the feature. This means that the same users will keep seeing the feature even as you increase the percentage of your user base that sees the feature.

## Custom stickiness {#custom-stickiness}

:::info
Custom stickiness is available starting from Unleash Enterprise v4.
:::

When using [the gradual rollout strategy](../reference/activation-strategies.md#gradual-rollout) or [feature toggle variants](./feature-toggle-variants.md), you can use parameters other than the user id to calculate stickiness. More specifically, you can use any field, custom or otherwise, of the [Unleash Context](../reference/unleash-context.md) as long as you have enabled custom stickiness for these fields.

:::note SDK compatibility

Custom stickiness is supported by all of our SDKs except for the Rust SDK. You can always refer to the [SDK compatibility table](../reference/sdks/index.md#server-side-sdk-compatibility-table) for the full overview.

:::

### Enabling custom stickiness

To enable custom stickiness on a field, navigate to the Create Context screen in the UI and find the field you want to enable. There's a "Custom stickiness" option at the bottom of the form. Enable this toggle and update the context field by pressing the "Update" button.

![The Create Context screen in the Unleash UI. There's a toggle at the bottom to control custom stickiness.](/img/enable_custom_stickiness.png)

## Project default stickiness

:::info Availability

Project default stickiness was introduced in **Unleash v5**.

:::

Each project in Unleash can have its own default stickiness context field. Whenever you add a gradual rollout strategy or variants to a feature in that project, Unleash will use the configured context field as the initial value. 

Only context fields that have the [custom stickiness](unleash-context.md#custom-stickiness) option turned on can be used as default stickiness fields.

If you don't specify a default custom stickiness, the project will use the "default" stickiness option, which works as described in the [calculation section](#calculation).

You can configure project default stickiness when you create a project or by editing the project later. 

![The Edit Project screen.  There is a dropdown for setting the default stickiness](/img/project_default_stickiness.png)
