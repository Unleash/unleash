---
id: unleash_context
title: Unleash Context
---

The **Unleash Context** contains information relating to the current feature toggle request. Unleash uses this context to evaluate [activation strategies](activation-strategies.md) and [strategy constraints](../advanced/strategy-constraints.md) and to calculate [toggle stickiness](../advanced/stickiness.md). The Unleash Context is an important feature of all the [Unleash client SDKs](../sdks/index.md).

## Structure

You can group the Unleash Context fields into two separate groups based on how they work in the client SDKs: **static**  and **dynamic** context fields.

**Static** fields' values remain constant throughout an application's lifetime. You'll typically set these when you initialize the client SDK.

**Dynamic** fields, however, can change with every request. You'll typically provide these when checking whether a toggle is enabled in your client.

_All fields are optional_, but some strategies depend on certain fields being present. For instance, [the UserIDs strategy](activation-strategies.md#userids) requires that the `userId` field is present on the Context.

The below table gives a brief overview over what the fields' intended usage is, their lifetime, and their type. Note that the exact type can vary between programming languages and implementations. Be sure to consult your specific client SDK for more information on its implementation of the Unleash Context.

| field name        | type                  | lifetime | description                                                                                                                                         |
|-------------------|-----------------------|----------|-----------------------------------------------------------------------------------------------------------------------------------------------------|
| `appName`         | `string`              | static   | the name of the application                                                                                                                         |
| `environment`[^1] | `string`              | static   | the environment the app is running in                                                                                                               |
| `userId`          | `string`              | dynamic  | an identifier for the current user                                                                                                                  |
| `sessionId`       | `string`              | dynamic  | an identifier for the current session                                                                                                               |
| `remoteAddress`   | `string`              | dynamic  | the app's IP address                                                                                                                                |
| `properties`      | `Map<string, string>` | dynamic  | a key-value store of any data you want                                                                                                              |
| `currentTime`[^2] | `DateTime`/`string`   | dynamic  | A `DateTime` (or similar) data class instance or a string in an RFC3339-compatible format. **Defaults to the current time** if not set by the user. |


### The `properties` field

The `properties` field is different from the others. You can use the `properties` field to provide arbitrary data to [custom strategies](../advanced/custom-activation-strategy.md) or to [strategy constraints](../advanced/strategy-constraints.md). The `properties` field is also where you add values for [custom context fields](#custom-context-fields).


#### A note on properties and constraints

Some SDK implementations of the Unleash Context allow for the values in the `properties` map to be of other types than a string type. Using non-string types as values may cause issues if you're using the property in a constraint. Because the Unleash Admin UI accepts any string as input for constraint checking, the SDKs must also assume that the value is a string.

As an example: You've created a custom field called `groupId`. You know group IDs will always be numeric. You then create a constraint on a strategy that says the user must be in group `123456`. If you were to set the property `groupId` to the number `123456` in the `properties` field on the SDK side, the constraint check would fail, because in most languages the number `123456` is not equal to the string `123456` (i.e. `123456 != "123456"`).



## Custom context fields

:::info Availability

Before Unleash 4.16, custom context fields were only available to Unleash Pro and Enterprise users. From 4.16 onwards, they're **available to everyone**. They were introduced in Unleash 3.2.28.

:::

Custom context fields allow you to extend the Unleash Context with more data that is applicable to your situation. Each context field definition consists of a name and an optional description. Additionally, you can choose to define a set of [_legal values_](#legal-values "legal values for custom context fields"), and you can choose whether or not the context field can be used in [custom stickiness calculations](../advanced/stickiness.md#custom-stickiness) for the [gradual rollout strategy](activation-strategies.md#customize-stickiness-beta) and for [feature toggle variants](../advanced/feature-toggle-variants.md).

When interacting with custom context fields in code, they must be accessed via the Unleash Context's `properties` map, using the context field's name as the key.

### Creating and updating custom context fields

You can create as many custom context fields as you wish. Refer to ["how to define custom context fields"](../how-to/how-to-define-custom-context-fields) for information on how you define your own custom context fields.

You can update custom context fields after they have been created. You can change everything about the definition except for the name.

### Legal values

By using the **legal values** option when creating a context field, you can create a set of valid options for a context field's values.
If a context field has a defined set of legal values, the Unleash Admin UI will only allow users to enter one or more of the specified values. If a context field _doesn't_ have any defined legal values, the user can enter whatever they want.

Using a custom context field called _region_ as an example: if you define the field's legal values as _Africa_, _Asia_, _Europe_, and _North America_, then you would only be allowed to use one or more of those four values when using the custom context field as a [strategy constraint](../advanced/strategy-constraints.md).

![A strategy constraint form with a constraint set to "region". The "values" input is a dropdown menu containing the options "Africa", "Asia", "Europe", and "North America", as defined in the preceding paragraph.](/img/constraints_legal_values.png)

### Custom stickiness

:::note
This feature is currently in beta and is not yet supported by all our SDKs. Check out the [SDK compatibility table](../sdks/index.md#server-side-sdk-compatibility-table) to see what SDKs support it at the moment.
:::

Any context field _can_ be used to [calculate custom stickiness](../advanced/stickiness.md#custom-stickiness). However, you need to explicitly tell Unleash that you want a field to be used for custom stickiness for it to be possible. You can enable this functionality either when you create the context field or at any later point. For steps on how to do this, see [the _How to define custom context fields_ guide](../how-to/how-to-define-custom-context-fields).



[^1]: If you're on Unleash 4.3 or higher, you'll probably want to use [the environments feature](../user_guide/environments.md) instead of relying on the `environment` context field when working with environments.

[^2]: Check the [*strategy constraints: advanced support* row of the compatibility table](../sdks/index.md#strategy-constraints-advanced-support) for an overview of which SDKs provide the `currentTime` property.
