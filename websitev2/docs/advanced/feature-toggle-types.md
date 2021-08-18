---
id: feature_toggle_types
title: Feature Toggle Types
---

> This feature was introduced in _Unleash v3.5.0_.

Starting with version `3.5.0` Unleash introduces the concept of feature toggle types. The toggle types are heavily inspired by [Pete Hodgson's article on feature toggles](https://martinfowler.com/articles/feature-toggles.html).

The idea is to make it easier for teams to manage their feature toggles, if they can more clearly classify them. The classification will also help us understand the [expected feature toggle lifetime](https://www.getunleash.io/blog/feature-toggle-life-time-best-practices). Some feature toggles are meant to live for a few weeks, while we work on the new functionality, while others are of a more permanent nature.

Feature toggle types currently supported by Unleash:

- **Release** - Used to enable trunk-based development for teams practicing Continuous Delivery. _Expected lifetime 40 days_
- **Experiment** - Used to perform multivariate or A/B testing. _Expected lifetime 40 days_
- **Operational** - Used to control operational aspects of the system's behavior. _Expected lifetime 7 days_
- **Kill switch** - Used to gracefully degrade system functionality. _(permanent)_
- **Permission** - Used to change the features or product experience that certain users receive. _(permanent)_

### Deprecate a feature toggle {#deprecate-a-feature-toggle}

Feature toggles can now also be marked as `stale` (deprecated). This allows us to clearly signal that we should stop using the feature toggle in our applications.

The `stale` property can utilized to help us manage "feature toggle debt" in various ways:

- Inform the developer working locally when we detect usage of a stale feature toggle.
- Use it to break the build if the code contains stale feature toggles.
- Send automatic PR to remove usage of completed toggles.
