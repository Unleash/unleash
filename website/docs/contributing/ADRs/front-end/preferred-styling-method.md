---
title: "ADR: preferred styling method"
---

This document supersedes [ADR: preferred styles import placement](./preferred-styles-import-placement.md)


## Background

In the codebase, we need to have a uniform way of performing style updates.

## Decision

We have decided to move away from using makeStyles as it's currently deprecated from @material/ui, and kept alive with an 
external interop package to maintain compatability with the latest version. The preferred path forward is to use styled components which is
supported natively in @material/ui and sparingly use the sx prop available on all mui components.

### Consequences: code sharing

With makeStyles it was common to reuse CSS fragments via library utilities. 
In the styled components approach we use themeable functions and  object literals 

```ts
import { Theme } from '@mui/material';

export const focusable = (theme: Theme) => ({
    color: theme.palette.primary.main,
});

export const flexRow = {
    display: 'flex',
    alignItems: 'center',
};
```

Usage:
```ts
const StyledLink = styled(Link)(({ theme }) => ({
    ...focusable(theme),
}));

<IconButton sx={focusable}/>
```
