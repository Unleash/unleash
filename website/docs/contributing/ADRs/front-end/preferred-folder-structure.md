---
title: "ADR: Preferred folder structure"
---

## Background

Folder structure is important in how easy it is to navigate and reason about the codebase. It's important to have a clear structure that is easy to understand and follow, while grouping related files together in such a way that is easy to find and remove.

## Decision

We have decided to create tree-like folder structure that mimics as closely as possible the relationship of the React components in the project. This has a number of benefits:

* If you are looking for a component, you can easily find it by looking at the folder structure.
* If you need to delete a component, you can be sure that all of the files connected to that component will be deleted if you delete the folder. This is supremely important, because it allows us to get rid of dead code easily and without having to worry about the consequences of deleting a file and worrying about whether it's used somewhere else.

## Folder structure example:

```
ProfilePage
  ProfilePage.tsx
  ProfilePage.styles.ts
  ProfileSettings
    ProfileSettings.tsx
    ProfileSettings.styles.ts
  ProfilePicture
    ProfilePicture.tsx
    ProfilePicture.styles.ts
```

Now you can clearly see that if you need to delete the `ProfilePage` component, you can simply delete the `ProfilePage` folder and all of the files connected to that component will be deleted.

If you experience that you need to create a component that is used in multiple places, the component should be moved to the closest possible ancestor. If this is not possible, the component should be moved to the `common` folder.
