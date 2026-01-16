---
title: "ADR: Preferred export"
---

## Background

In the codebase, we have discovered that default exports create multiple problems. One is that you can rename the component when importing it, which can cause confusion. Another is that it is harder to find the component when you are looking for it, as you have to look for the file name instead of the component name (solved by ADR for naming, but still relevant).

## Decision

We have decided to use named exports. This will allow us to eliminate the possiblity of exporting a component and renaming it in another file. It also allows us easy access to advanced refactors across the project, because renaming in one place will propagate to all the other places where that import is referenced. This resolves the issues described in the background without any significant downsides.
