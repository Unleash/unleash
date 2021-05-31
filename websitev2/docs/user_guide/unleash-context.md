---
id: unleash_context
title: Unleash Context
---

To standardize a few activation strategies, we also needed to standardize the Unleash context, which contains fields that vary per request, required to implement the activation strategies.

The Unleash context is compromised by a set of predefined fields. The static fields does not change in the life-time of your application, while dynamic fields can change per feature toggle evaluation.

**Static context fields**

- appName: String
- environment: String

**Dynamic context fields**

- userId: String,
- sessionId: String,
- remoteAddress: String,
- properties: Map<String, String>

All fields are optional, but if they are not set you will not be able to use certain activation strategies. E.g., the `userWithId` strategy obviously depends on the `userId` field.

The `properties` field is more generic and can be used to provide more arbitrary data to strategies. Typical usage is to add more metadata. For instance, the `betaUser` strategy may read a field from `properties` to check whether the current user is a beta user.

In Unleash Enterprise you may also pre-configure all you customer context fields (`properties`) and use them together with [strategy constraints](../advanced/strategy_constraints) to compose any target rules you need.
