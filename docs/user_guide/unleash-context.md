---
id: unleash_context
title: Unleash Context
---

To standardise a few activation strategies, we also needed to standardise the Unleash context, which contains fields that vary per request, required to implement the activation strategies.

The unleash context is defined by these fields:

- userId: String,
- sessionId: String,
- remoteAddress: String,
- properties: Map<String, String>
- appName: String
- environment: String

All fields are optional, but if they are not set you will not be able to use certain activation strategies.

E.g., the `userWithId` strategy obviously depends on the `userId` field.

The `properties` field is more generic and can be used to provide more abritary data to strategies. Typical usage is to add more metadata. For instance, the `betaUser` strategy may read a field from `properties` to check whether the current user is a beta user.
