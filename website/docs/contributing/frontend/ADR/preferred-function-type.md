---
title: "ADR: Preferred function type"
---

## Background

In the codebase, we have found a need to standardise function types in order to keep the codebase recognizible across different sections, and to encourage / discourage certain patterns.

## Decision

We have decided to use arrow functions across the board in the project. Both for helper functions and for react components.

```jsx
// Do:
const myFunction = () => {};
const MyComponent = () => {};

// Don't:
function myFunction() {}
function MyComponent() {}
```

The reason for this decision is to remove mental clutter and free up capacity to easily navigate the codebase. In addition, using arrow functions allows you to avoid the complexity of losing the scope of `this` for nested functions, and keeps `this` stable without any huge drawbacks. Losing hoisting is an acceptable compromise.
