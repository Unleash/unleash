---
title: Dependent Features
---

:::info Availability

**Dependent features** were first introduced in Unleash 5.7 for Pro and Enterprise users.

**Variant dependencies** were first introduced in Unleash 5.12 for Pro and Enterprise users.
:::

## Overview

Dependent features allow to define a child feature flag that depends on a parent feature flag.  
A feature flag can have only one parent dependency but multiple child flags can share the same parent. For a child flag to be activated, its parent dependency must be satisfied.

## Parent dependency criteria

* **Project Association**: Both parent and child flags should belong to the same project.
* **Single Level Dependency**: The parent flag can’t have its own parent, ensuring a straightforward, single-level dependency.
* **Parent Value**: Parent value should match predefined feature status and variant criteria.

### Parent value criteria 

In order for the child feature to be evaluated, the corresponding parent value criteria must be satisfied.

Parent value criteria can be set to one of the 3 options:
* parent feature must be **enabled**. 
* parent feature must be **disabled**. This is useful when your parent is a [kill-switch](./feature-toggle-types.md#feature-toggle-types) with the inverted enabled/disabled logic.
* parent feature must be **enabled with variants**. This is useful when your parent is part of A/B testing, and you need **variant dependencies**.

For the **variant dependencies**, if the parent feature variant is evaluated to the expected value, the dependency is satisfied.
You can specify variant values from all [strategy variants](./strategy-variants.md) and all [feature environment variants](./feature-toggle-variants.md). The parent dependency variant 
is compared to the actual value that the parent dependency is evaluated to in a given environment.
Consult [strategy variants order](./strategy-variants.md#strategy-variants-and-strategies-order) and [variants comparison](./strategy-variants#strategy-variants-vs-feature-flag-variants) sections for more details on the variant evaluation order.

## Managing dependencies

### Adding

Introduce dependencies either through the UI or API, also applicable when copying a child feature with an existing parent dependency.

![A button for adding parent dependency.](/img/add-parent-dependency.png 'Adding a new parent feature dependency')

### Removing

Eliminate them through the UI or API. Dependencies are also removed when archiving a child feature. A parent feature can’t be removed if it would leave a child feature orphaned. To remove both, batch archive them. If Unleash confirms no other child features are using the parent, archiving proceeds.

![A button for deleting parent dependency.](/img/delete-parent-dependency.png 'Depeting a parent feature dependency')


## Permissions

The **Update feature dependency** project permission, auto-assigned to admin and project members, allows managing dependencies.

## Metrics calculation

Metrics are influenced solely by the evaluation of child features.

## Client SDK Support {#client-sdk-support}

To make use of dependent feature, you need to use a compatible client. Client SDK with variant support:

- [unleash-client-node](https://github.com/Unleash/unleash-client-node) (from v4.2.0)
- [unleash-client-java](https://github.com/Unleash/unleash-client-java) (from v8.4.0)
- [unleash-client-go](https://github.com/Unleash/unleash-client-go) (from v3.9.2)
- [unleash-client-python](https://github.com/Unleash/unleash-client-python) (from v5.9.0)
- [unleash-client-ruby](https://github.com/Unleash/unleash-client-ruby) (from v4.6.0)
- [unleash-client-dotnet](https://github.com/Unleash/unleash-client-dotnet) (from v3.4.0)
- [unleash-client-php](https://github.com/Unleash/unleash-client-php) (from v2.2.0)
- Client SDKs talking to [unleash-proxy](https://github.com/Unleash/unleash-proxy) (from v0.18.0)
- Client SDKs talking to [unleash-edge](https://github.com/Unleash/unleash-edge) (from v13.1.0)
- Client SDKs talking to Frontend API in [unleash-server](https://github.com/Unleash/unleash) (from v5.7.0)
- Unleash Playground in [unleash-server](https://github.com/Unleash/unleash) (from v5.7.0)


If you would like to give feedback on this feature, experience issues or have questions, please feel free to open an issue on [GitHub](https://github.com/Unleash/unleash/).
