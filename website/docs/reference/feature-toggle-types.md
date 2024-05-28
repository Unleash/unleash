---
title: Feature Flag Types
---

> This feature was introduced in _Unleash v3.5.0_.

You can use feature flags to support different use cases, each with their own specific needs. Heavily inspired by [Pete Hodgson's article on feature flags](https://martinfowler.com/articles/feature-toggles.html), Unleash introduced the concept of feature flag types in version `3.5.0`.

A feature flag's type affects only two things:
1. It gives the flag an appropriate icon
2. The flag's expected lifetime changes

Aside from this, there are no differences between the flag types and you can always change the type of a flag after you have created it.

Classifying feature flags by their type makes it easier for you manage them: the flags get different icons in the flag list and you can sort the flags by their types.

![Five feature flags, each of a different type, showing the different icons that Unleash uses for each flag type.](/img/toggle_type_icons.png "Feature flag type icons")

A flag's type also helps Unleash understand the [flag's expected lifetime](#expected-lifetimes).
## Feature flag types

Here's the list of the feature flag types that Unleash supports together with their intended use case and expected lifetime:

| Feature flag type | Used to ...                                                                                                                                                       | Expected lifetime |
|---------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------|
| Release             | Enable trunk-based development for teams practicing Continuous Delivery.                                                                                          | 40 days           |
| Experiment          | Perform multivariate or A/B testing.                                                                                                                              | 40 days           |
| Operational         | Control operational aspects of the system's behavior.                                                                                                             | 7 days            |
| Kill switch         | Gracefully degrade system functionality. You can read about [kill switch best practices](https://www.getunleash.io/blog/kill-switches-best-practice) on our blog. | Permanent         |
| Permission          | Change the features or product experience that certain users receive.                                                                                             | Permanent         |

### Expected lifetimes

:::info

The ability to update a feature flag type's expected lifetime is currently in development. We expect to release it in one of the upcoming releases.

:::

A feature flag's expected lifetime is an indicator of how long Unleash expects flags of that type to be around. Some feature flags are meant to live for a few weeks as you work on new functionality, while others stick around for much longer. As a part of good code hygiene, you should clean up your feature flags when they have served their purpose. This is further explored in the document on [technical debt](technical-debt.md).

Each feature flag type in Unleash has an assigned expected lifetime, after which the system will consider this feature _potentially stale_. The reasoning behind each type's expected lifetime is detailed in this [blog post on best practices for feature flag lifetimes](https://www.getunleash.io/blog/feature-toggle-life-time-best-practices).

Unleash admins can change the expected lifetime of Unleash's feature types from the Unleash configuration menu.


## Deprecating feature flags {#deprecate-a-feature-toggle}

You can mark feature flags as `stale`. This is a way to deprecate a feature flag without removing the active configuration for connected applications. Use this to signal that you should stop using the feature in your applications. Stale flags will show as stale in the ["technical debt dashboard"](technical-debt.md).

When you mark a flag as stale, Unleash will emit an event. You can use [an integration](integrations/integrations.md) to integrate this with your systems, for instance to post a message in a Slack channel.

Additionally, with some extra work, you can also use the `stale` property to:

- Inform developers that a flag is stale _while_ they're developing.
- Break a project build if the code contains stale feature flags.
- Send automatic PRs to remove usage of flags that have served their purpose.
