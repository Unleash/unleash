---
title: "ADR: Preferred export"
---

## Background

We have seen a need to standardize how to export from files in the project, in order to achieve consistency and avoid situations where we can have a component default exported as one name and renamed as something else in a different file. For example:

```
// Problem example
// File A

const MyComponent = () => {

}

export default MyComponent;

// File B
import NewName from '../components/MyComponent/MyComponent.tsx';
```

The above can cause massive confusion and make it hard to navigate the codebase.

## Decision

We have decided to standardise exports on named exports. This will allow us to eliminate the possiblity of exporting a component and renaming it in another file.

```jsx
// Do:
export const MyComponent = () => {};

// Don't:
const MyComponent = () => {};

export default MyComponent;
```

The reason for this decision is to remove mental clutter and free up capacity to easily navigate the codebase. If you can always deduce that the component is named as it is defined, then finding that component becomes a lot easier. This will ensure that we remove unnecessary hurdles to understand and work within the codebase.
