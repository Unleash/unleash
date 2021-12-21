---
id: custom_activation_strategy
title: Custom Activation Strategies
---

:::tip
This document is a reference for custom activation strategies. If you're looking for a guide on how to use them, see the [_how to use custom strategies_ guide](../how-to/how-to-use-custom-strategies.md).
:::

**Custom activation strategies** let you define your own activation strategies to use with Unleash. When the [built-in activation strategies](../user_guide/activation-strategies.md) aren't enough, custom activation strategies are there to provide you with the flexibility you need.

Custom activation strategies work exactly like the built-in activation strategies when working in the admin UI.

## Definition

![A strategy creation form. It has fields labeled "strategy name" — "TimeStamp" — and "description" — "activate toggle after a given timestamp". It also has fields for a parameter named "enableAfter". The parameter is of type "string" and the parameter description is "Expected format: YYYY-MM-DD HH:MM". The parameter is required.](/img/timestamp_create_strategy.png)

You define custom activation strategies on your Unleash instance, either via the admin UI or via the API. A strategy contains:

- A strategy **name**: You'll use this to refer to the strategy in the UI and in code.
- An optional **description**: Use this to describe what the strategy should do.
- An optional list of **parameters**: Use this to provide the strategy with arguments it should use in its evaluation.

The strategy **name** is the only required parameter, but adding a good **description** will make it easier to remember what a strategy should do. The list of **parameters** lets you pass data from the Unleash instance to the strategy implementation.

### Parameters

![The strategy configuration screen for the custom "TimeStamp" strategy. The "enableAfter" field says "2021-12-25 00:00".](/img/timestamp_use_strategy.png)

Parameters let you provide arguments to your strategy that it can access for evaluation. When creating a strategy, each parameter can be either required or optional.

If a strategy has a required parameter and you don't give it a value when creating the strategy, the strategy will not activate?

Each parameter consists of three parts:

- a **name**: must be unique among the strategy's parameters.
- an optional **description**: describe the purpose or format of the parameter.
- a parameter **type**: dictates the kind of input field the user will see in the admin UI and the type of the value in the implementation code.


#### Parameter types

Each parameter has one of five different parameter types. A parameter's type impacts the kind of controls shown in the admin UI and also changes how the value is represented in code.

| type name  | code representation[^1] | UI control               |
|------------|-------------------------|--------------------------|
| string     | `string`                | A standard input field   |
| percentage | `int` between 0 and 100 | A value slider           |
| list       | `string[]`              | A multi-input text field |
| number     | `int`                   | A numeric text field     |
| boolean    | `boolean`               | An on/off toggle         |


![A strategy with five parameters, one of each type.](/img/strategy-parameters-ui-controls.png)

## Implementation

:::note
If you have not implemented the strategy in your client SDK, the check will always return `false` because the client doesn't recognize the strategy.
:::

While custom strategies are _defined_ on the Unleash server, they must be _implemented_ on the client. All official Unleash client SDKs provide a way for you to implement custom strategies. You should refer to the individual SDK's documentation for specifics, but for an example, you can have a look at the [_Node.js client implementation_ section in the _how to use custom strategies_ guide](../how-to/how-to-use-custom-strategies.md#client-implementation).

The exact method for implementing custom strategies will vary between SDKs, but the server SDKs follow the same patterns. For front-end client SDKs ([Android](../sdks/android-proxy.md), [JavaScript](../sdks/proxy-javascript.md), [React](../sdks/proxy-react.md), [iOS](../sdks/proxy-ios.md)), the custom activation strategy must be implemented in the [Unleash Proxy](../sdks/unleash-proxy.md).


When implementing a strategy in your client, you will get access to the strategy's parameters and the Unleash Context. Again, refer to your specific SDK's documentation for more details.


[^1]: The exact type representation in code will vary depending on the language and its type system. See the docs for your client SDKs for specifics.
