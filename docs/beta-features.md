---
id: beta_features
title: Beta Features
---

## Beta Features

In this section, we will introduce the beta features available in Unleash. These features are considered stable enough to use in production, but they are subject to change in later versions in Unleash. You must, therefore, take extra care updating Unleash if you depend on these features.

### Feature Toggle Variants

> This feature was introduced in _Unleash v3.2.0_. To enable this feature, you must create a new feature toggle named `unleash.beta.variants` and make sure to enable it.

Do you want to facilitate more advanced experimentations? Do you want to use Unleash to handle your A/B experiments? Say hello to feature toggle variants!

You can now extend feature toggles with multiple variants. This feature enables you to extend a feature toggle to divide your traffic among a set of variants.

![toggle_variants](assets/variants.png 'Feature Toggle Variants')

#### How does it work?

Unleash will first use activation strategies to decide whether a feature toggle is considered enabled or disabled for the current user.

If the toggle is considered **enabled**, the Unleash client will select the correct variant for the request. Unleash clients will use values from the Unleash context to make the allocation predictable. `UserId` is the preferred value, then `sessionId` and `remoteAdr`. If no context data is provided, the traffic will be spread randomly for each request.

If the toggle is considered **disabled** you will get the built-in `disabled` variant.

> If you change the number of variants, it will affect variant allocations. This means that some of the users will be moved to the next variant.

_Java SDK example:_

```java
Variant variant = unleash.getVariant("toggle.name", unleashContext);
System.out.println(variant.getName());
```

### Payload

#### Client SDK Support

To make use of toggle variants, you need to use a compatible client. Client SDK with variant support:

- [unleash-client-node](https://github.com/Unleash/unleash-client-node) (from v3.2.0)
- [unleash-client-java](https://github.com/Unleash/unleash-client-java) (from v3.2.0)

#### Limitations

- Currently, you can not set the variant weights yourself. The plan is to make this customizable. To have it stable over time the total weights need to be stable, and we have currently defined the sum to be 100, meaning we have 100 slots to spread the traffic.
- You are only able to provide overrides based on `userId`. This allows you to control which variant a specific user should get. In the future, you will be able to define overrides on all context parameters.
- The payload only supports `type=string`. This might change in the future. For now, you can pass an optional string payload to the client. Your application is responsible for parsing it correctly depending on the format, e.g. JSON, CSV, etc.

If you would like to give feedback on this feature, experience issues or have questions, please feel free to open an issue on [GitHub](https://github.com/Unleash/unleash/).
