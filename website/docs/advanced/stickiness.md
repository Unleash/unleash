---
id: stickiness
title: Stickiness
---

Stickiness is how Unleash guarantees that the same user gets the same features every time. Stickiness is useful in any scenario where you want to either show a feature to only a subset of users or give users a variant of a feature.

## Calculation

By default, Unleash calculates stickiness based on the user id and the group id. If the user id is unavailable, it falls back to using the session id instead. It hashes these values to a number between 0 and 100. This number is what determines whether a user will see a specific feature or variant. Because the process is deterministic, the same user will always get the same number.

## Consistency

Because the number assigned to a user won't change, Unleash also guarantees that the a user will keep seeing the same features even if certain other parameters change.

When using the [gradual rollout activation strategy](https://docs.getunleash.io/user_guide/activation_strategy#gradual-rollout), any user whose number is less than or equal to the rollout percentage. This means that the same users will keep seeing the feature even if you increase the percentage of your user base that sees the feature.


## Custom stickiness

Gradual rollout and variants allow you to use a custom stickiness ...
