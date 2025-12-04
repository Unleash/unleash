---
title: Unleash context
---

import SearchPriority from '@site/src/components/SearchPriority';

<SearchPriority level="high" />

The **Unleash context** contains information related to the current feature flag request. Unleash uses this context to evaluate [activation strategies](activation-strategies) and [strategy constraints](/concepts/activation-strategies#constraints) and to calculate [flag stickiness](/concepts/stickiness). The Unleash Context is an important feature of all the [Unleash client SDKs](/sdks).

## Overview

You can group the Unleash Context fields into two separate groups based on how they work in the client SDKs: **static**  and **dynamic** context fields.

**Static** fields remain constant throughout an application's lifetime and are typically set during client SDK initialization.

**Dynamic** fields can change with each request and are usually provided when checking if a flag is enabled in your client.

All fields are optional, but some strategies depend on certain fields being present. For instance, [the UserID strategy](/concepts/predefined-strategy-types#userids) requires that the `userId` field is present on the context.

The following table gives an overview of the fields' intended usage, their lifetime, and their type. The exact type can vary between programming languages and implementations. Check the documentation of your specific client SDK for more information on its implementation of the Unleash Context.

| field name        | type                  | lifetime | description                                                                                                                                         |
|-------------------|-----------------------|----------|-----------------------------------------------------------------------------------------------------------------------------------------------------|
| `appName`         | `string`              | static   | The name of the application.                                                                                                                         |
| `environment` | `string`              | static   | The environment the application is running in. From 4.3+, use [environments](/concepts/environments) instead.                                                                                                               |
| `userId`          | `string`              | dynamic  | The identifier of the current user.                                                                                                                  |
| `sessionId`       | `string`              | dynamic  | The identifier of the current session.                                                                                                               |
| `remoteAddress`   | `string`              | dynamic  | The application's IP address.                                                                                                                                |
| `properties`      | `Map<string, string>` | dynamic  | A key-value store for additional data.                                                                                                              |
| `currentTime` | `DateTime`/`string`   | dynamic  | A `DateTime` (or similar) data class instance or a string in an RFC-3339 format. **Defaults to the current time** if not set by the user; requires [SDK compatibility](/sdks#feature-compatibility-in-backend-sdks). |


### The `properties` field

The `properties` field is different from the others. You can use the `properties` field to provide arbitrary data to [strategy constraints](/concepts/activation-strategies#constraints) and add values for [custom context fields](#custom-context-fields).

Some SDK implementations of the Unleash Context allow for the values in the `properties` map to be of other types than a string type. Using non-string types as values may cause issues if you're using the property in a constraint. Because the Unleash Admin UI accepts any string as input for constraint checking, the SDKs must also assume that the value is a string.

As an example: You've created a custom field called `groupId`. You know group IDs will always be numeric. You then create a constraint on a strategy that says the user must be in group `123456`. If you were to set the property `groupId` to the number `123456` in the `properties` field on the SDK side, the constraint check would fail, because in most languages the number `123456` is not equal to the string `123456` (i.e. `123456 != "123456"`).

For operators that work on non-string types, such as numeric and datetime operators, these will convert the string value to the appropriate type before performing the comparison. This means that if you use a numeric greater than operator for the value `"5"`, it will convert that value to the number `5` before doing the comparison. If the value can't be converted, the constraint will fail.

## Custom context fields

:::note Availability

**Version**: `4.16+`

:::

Custom context fields allow you to extend the Unleash Context with custom data. Each context field definition consists of a name and an optional description. Additionally, you can define a set of [_legal values_](#legal-values "legal values for custom context fields"), and define if the context field can be used in [custom stickiness calculations](/concepts/stickiness#custom-stickiness) for the [gradual rollout strategy](/concepts/activation-strategies) and for [feature flag variants](/concepts/feature-flag-variants).

When interacting with custom context fields in code, they must be accessed via the Unleash Context's `properties` map, using the context field's name as the key.

### Add a custom context field

To add a custom context field in the Admin UI, do the following:

1. Go to **Configure** > **Context fields** and click **New context field**. 
2. Enter a context name.
3. In **Legal value**, enter a value you want the field to support and click **Add**. You can add additional values if needed.
4. Optionally, enable [custom stickiness](/concepts/stickiness#custom-stickiness) if you'd like to use this field to group users for a gradual rollout strategy.
5. Click **Create context**.

Once created, you can modify any aspect of a field’s definition—except its name. You can create as many custom context fields as you need.

### Legal values

By using the **legal values** option when creating a context field, you can create a set of valid options for a context field's values.
If a context field has a defined set of legal values, the Unleash Admin UI will only allow users to enter one or more of the specified values. If a context field _doesn't_ have any defined legal values, the user can enter whatever they want.

Using a custom context field called _region_ as an example: if you define the field's legal values as _Africa_, _Asia_, _Europe_, and _North America_, then you would only be allowed to use one or more of those four values when using the custom context field as a [strategy constraint](/concepts/activation-strategies#constraints).

![A strategy constraint form with a constraint set to "region". The "values" input is a dropdown menu containing the options "Africa", "Asia", "Europe", and "North America", as defined in the preceding paragraph.](/img/constraints_legal_values.png)

### Custom stickiness

:::note SDK compatibility

Custom stickiness is supported by all SDKs except for the Rust SDK. Refer to the [SDK compatibility table](/sdks#feature-compatibility-in-backend-sdks) for more information.

:::

Any context field _can_ be used to [calculate custom stickiness](/concepts/stickiness#custom-stickiness). However, you need to explicitly tell Unleash that you want a field to be used for custom stickiness for it to be possible. You can enable this functionality either when you create a context field or update an existing one. 
