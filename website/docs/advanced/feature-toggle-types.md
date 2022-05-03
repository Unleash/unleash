---
id: feature_toggle_types
title: Feature Toggle Types
---

> This feature was introduced in _Unleash v3.5.0_.

You can use feature toggles to support different use cases, each with their own specific needs. Heavily inspired by [Pete Hodgson's article on feature toggles](https://martinfowler.com/articles/feature-toggles.html), Unleash introduced the concept of feature toggle types in version `3.5.0`.

A feature toggle's type affects only two things:
1. It gives the toggle an appropriate icon
2. The toggle's expected lifetime changes

Aside from this, there are no differences between the toggle types and you can always change the type of a toggle after you have created it.

Classifying feature toggles by their type makes it easier for you manage them: the toggles get different icons in the toggle list and you can sort the toggles by their types.

![Five feature toggles, each of a different type, showing the different icons that Unleash uses for each toggle type.](/img/toggle_type_icons.png "Feature toggle type icons")

A toggle's type also helps Unleash understand the [toggle's expected lifetime](https://www.getunleash.io/blog/feature-toggle-life-time-best-practices): some feature toggles are meant to live for a few weeks as you work on new functionality, while others stay in for much longer. When a feature toggle lives past its expected lifetime, Unleash will mark it as _potentially stale_. See the [technical debt section](../user_guide/technical_debt) for more information on what this means and how to handle it.

## Feature toggle types

Here's the list of the feature toggle types that Unleash supports together with their intended use case and expected lifetime:

- **Release** -  Enable trunk-based development for teams practicing Continuous Delivery. _Expected lifetime 40 days_
- **Experiment** - Perform multivariate or A/B testing. _Expected lifetime 40 days_
- **Operational** - Control operational aspects of the system's behavior. _Expected lifetime 7 days_
- **Kill switch** - Gracefully degrade system functionality. You can read about [kill switch best practices](https://www.getunleash.io/blog/kill-switches-best-practice) on our blog. _(permanent)_
- **Permission** - Change the features or product experience that certain users receive. _(permanent)_

## Deprecating feature toggles {#deprecate-a-feature-toggle}

You can mark feature toggles as `stale`. This is a way to deprecate a feature toggle without removing the active configuration for connected applications. Use this to signal that you should stop using the feature in your applications. Stale toggles will show as stale in the ["technical debt dashboard"](../user_guide/technical_debt).

When you mark a toggle as stale, Unleash will emit an event. You can use [an addon](../addons/addons.md) to integrate this with your systems, for instance to post a message in a Slack channel.

Additionally, with some extra work, you can also use the `stale` property to:

- Inform developers that a toggle is stale _while_ they're developing.
- Break a project build if the code contains stale feature toggles.
- Send automatic PRs to remove usage of toggles that have served their purpose.
