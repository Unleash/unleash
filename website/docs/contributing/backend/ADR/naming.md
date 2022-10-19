---
title: "ADR: Naming"
---

## Background

In the codebase, we have found a need to have a common way of naming things in order to ensure consistency. It's important that files are named after the contents of the file to ensure that it's easy to search for files. You should be able to find the file you need in the command line without the help of advanced IDEs. This can easily be solved by proper naming. It's also crucial that the naming is consistent across the project, if we are using different naming conventions in different places, it will be hard to navigate the codebase.

## Decision

We have decided to use a naming convention where the files are named after the main class that it contains. Example:

```js
feature-toggle-service.ts

class FeatureToggleService {
  ...
}
```

The reason for this decision is to remove mental clutter and free up capacity to easily navigate the codebase. Knowing that a file is named after the class that it contains allows you to quickly scan a file without watching for a context where the class is used in order to understand what it is.
