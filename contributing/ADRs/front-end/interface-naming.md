---
title: "ADR: Interface naming"
---

## Background

In the codebase, we have found a need to have a common way of naming interfaces in order to ensure consistency.

## Decision

We have decided to use a naming convention of appending the letter `I` in front of interfaces to signify that we are in fact using an interface. For props, we use `IComponentNameProps`.

```jsx
// Do:
interface IMyInterface {}
interface IMyComponentNameProps {}

// Don't:
interface MyInterface {}
interface MyComponentName {}
```

The reason for this decision is to remove mental clutter and free up capacity to easily navigate the codebase. Knowing that an interface is prefixed with `I` allows you to quickly scan a file without watching for a context where the interface is used in order to understand what it is.
