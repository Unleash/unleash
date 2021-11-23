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

A toggle's type also helps Unleash understand the [toggle's expected lifetime](https://www.getunleash.io/blog/feature-toggle-life-time-best-practices): some feature toggles are meant to live for a few weeks as you work on new functionality, while others stay in for much longer. When a feature toggle lives past its expected lifetime, Unleash will mark it as _potentially stale_. See the [technical debt section](/user_guide/technical_debt) for more information on what this means and how to handle it.

## Feature toggle types

Here's the list of the feature toggle types that Unleash supports together with their intended use case and expected lifetime:

- **Release** -  Enable trunk-based development for teams practicing Continuous Delivery. _Expected lifetime 40 days_
- **Experiment** - Perform multivariate or A/B testing. _Expected lifetime 40 days_
- **Operational** - Control operational aspects of the system's behavior. _Expected lifetime 7 days_
- **Kill switch** - Gracefully degrade system functionality. _(permanent)_
- **Permission** - Change the features or product experience that certain users receive. _(permanent)_

## Deprecating a feature toggle {#deprecate-a-feature-toggle}

You can mark feature toggles as `stale`. This is a way to deprecate a feature toggle without removing the active configuration for connected applications. Use this to signal that you should stop using the feature in your applications.

The `stale` property can utilized to help us manage ["feature toggle debt"](/user_guide/technical_debt) in various ways:

- Inform the developer working locally when we detect usage of a stale feature toggle.
- Use it to break the build if the code contains stale feature toggles.
- Send automatic PR to remove usage of completed toggles.
