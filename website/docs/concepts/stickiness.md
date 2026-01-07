---
title: Stickiness
---

import SearchPriority from '@site/src/components/SearchPriority';

<SearchPriority level="high" />

_Stickiness_ is how Unleash guarantees that the same user gets the same features every time. Stickiness is useful in any scenario where you want to either show a feature to only a subset of users or give users a variant of a feature.

## Calculation

By default, Unleash calculates stickiness based on the user id and the group id. If the user id is unavailable, it falls back to using the session id instead. It hashes these values to a number between 0 and 100 using the [MurmurHash hash function](https://en.wikipedia.org/wiki/MurmurHash). This number is what determines whether a user will see a specific feature or variant. Because the process is deterministic, the same user will always get the same number.

If both the user id and the session id is unavailable, the calculation returns a random value and stickiness is not guaranteed.

## Consistency

Because the number assigned to a user won't change, Unleash also guarantees that the a user will keep seeing the same features even if certain other parameters change.

For instance: When using the [gradual rollout activation strategy](/concepts/activation-strategies), any user whose number is less than or equal to the rollout percentage will see the feature. This means that the same users will keep seeing the feature even as you increase the percentage of your user base that sees the feature.

## Custom stickiness

:::note Availability

**Plan**: [Enterprise](https://www.getunleash.io/pricing) | **Version**: `4.0+` and [SDK compatibility](/sdks#feature-compatibility-in-backend-sdks).

:::

When using [the gradual rollout strategy](/concepts/activation-strategies) or [feature flag variants](/concepts/feature-flag-variants), you can use parameters other than the user id to calculate stickiness. More specifically, you can use any field, custom or otherwise, of the [Unleash Context](/concepts/unleash-context) as long as you have enabled custom stickiness for these fields.


### Enabling custom stickiness

To enable custom stickiness on a field, navigate to the Create Context screen in the UI and find the field you want to enable. There's a "Custom stickiness" option at the bottom of the form. Enable this flag and update the context field by pressing the "Update" button.

![The Create Context screen in the Unleash UI. There's a flag at the bottom to control custom stickiness.](/img/enable_custom_stickiness.png)

## Project default stickiness

:::note Availability

**Version**: `5.0+`

:::

Each project in Unleash can have its own default stickiness context field. Whenever you add a gradual rollout strategy or variants to a feature in that project, Unleash will use the configured context field as the initial value. 

Only context fields that have the [custom stickiness](unleash-context#custom-stickiness) option turned on can be used as default stickiness fields.

If you don't specify a default custom stickiness, the project will use the "default" stickiness option, which works as described in the [calculation section](#calculation).

You can configure project default stickiness when you create a project or by editing the project later. 

![The Edit Project screen.  There is a dropdown for setting the default stickiness](/img/project_default_stickiness.png)
