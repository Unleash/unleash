---
id: beta_features
title: Beta Features
---

## Beta Features

In this section we will introduce beta features available in Unleash. These features are considered stable enough to use in production, but they are subject to change in later versions in Unleash. You must therefore take extra care updating Unleash if you depend on these features.

### Feature Toggle Variants

> This feature was introduces in _Unleash v3.2.0_. To enable this feature you must create a new enabled feature toggle named `unleash.beta.variants`

Do you want to facilitate more advanced experimentations? Do you want to use Unleash to handle you A/B experiments? Say hello to feature toggle variants!

You can now extend your feature toggles with multiple variants! This feature enable you to extend your toggle to also spread your traffic among a set of variants.

![toggle_variants](assets/variants.png 'Feature Toggle Variants')

#### How does it work?

Unleash will first use activation strategies in order to decide whether a feature toggle is considered enabled or disabled for the current user.

If the toggle is considered **enabled**, Unleash client will select the correct variant for the request. Unleash clients will use values from the Unleash context in order to make the allocation predictable. `UserId` is the preferred value, then `sessionId` and `remoteAdr`. If no context data is provided the traffic will be spread randomly for each request.

If the toggle is considered **disabled** you will get the built-in `disabled` variant.

> If you change the number of variants it will affect variant allocations. This means that some of the users will be moved to the next variant.

_Java SDK example:_

```java
Variant variant = unleash.getVariant("toggle.name", unleashContext);
System.out.println(variant.getName());
```

### Payload

#### Client SDK Support

To make use of toggle variants you need to use a compatible client. Client SDK with variant support:

- [unleash-client-node](https://github.com/Unleash/unleash-client-node) (from v3.2.0)
- [unleash-client-java](https://github.com/Unleash/unleash-client-java) (from v3.2.0)

#### Limitations

- Currently you can not set the variant weights yourself. The plan is to make this customizable. In order to have it stable over time the total weights needs to be stable, and we have currently defined the sum to be 100, meaning we have 100 slots to spread the traffic.
- You are only able to provide overrides based on `userId`. This allows you to control which variant a specific user should get. In the future you will be able to define overrides on all context parameters.
- Payload only support `type=string`. This might change in the future. For now you can pass an optional string payload to the client and your application is responsible for parsing it correctly (JSON, csv, etc).

If you want to give feedback on this feature, experiences issues or have questions please feel free to open an issue request on [GitHub](https://github.com/Unleash/unleash/).
