---
title: "ADR: Component naming and file naming"
---

## Background

In the codebase, we have found a need to have a common way of naming components so that components can be (a) easily searched for, (b) easily identified as react components and (c) be descriptive in what they do in the codebase.

## Decision

We have decided to use a naming convention for components that uppercases the first letter of the component. This also extends to the filename of the component. The two should always be the same:

```jsx
// Do:
// MyComponent.ts

const MyComponent = () => {};

// Don't:
// someRandomName.ts

const MyComponent = () => {};
```

The reason for this decision is to remove mental clutter and free up capacity to easily navigate the codebase. Knowing that a component name has the same name as the filename will remove any doubts about the file contents quickly and in the same way follow the React standard of uppercase component names.

### Deviations

In some instances, for simplicity we might want to create internal components or child components for a larger component. If these child components are small enough in size and it makes sense to keep them in the same file as the parent (AND they are used in no other external components) it's fine to keep in the same file as the parent component.
