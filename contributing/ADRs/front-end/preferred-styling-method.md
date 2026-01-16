---
title: "ADR: preferred styling method"
---

This document supersedes [ADR: preferred styles import placement](/contributing/ADRs/front-end/deprecated/preferred-styles-import-placement)


## Background

In the codebase, we need to have a uniform way of performing style updates.

## Decision

We have decided to move away from using makeStyles as it's currently deprecated from @material/ui, and kept alive with an
external interop package to maintain compatability with the latest version. The preferred path forward is to use styled components which is
supported natively in @material/ui and sparingly use the sx prop available on all mui components.

### When to use `sx` vs `styled`

As with everything else, whether to use styled components or the `sx` prop depends on the context.

Styled components have better performance characteristics, but it's fairly minor (refer to Material UI's [performance tradeoffs](https://mui.com/system/getting-started/usage/#performance-tradeoffs) doc for more information). So unless you're rendering something a lot of times, it's not really a big deal. But when in doubt: Use styled components. And when using a styled component feels like too much overhead, consider using the `sx` prop.

### Consequences: code sharing

With makeStyles it was common to reuse CSS fragments via library utilities.
In the styled components approach we use themeable functions and object literals.

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
