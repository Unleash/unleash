---
title: "ADR: preferred styles import placement"
---

## Background

SUPERSEDED BY [ADR: Preferred styling method](./preferred-styling-method.md)

In the codebase, we have found a need to standardise where to locate the styles import. When using CSS modules, the styles import placement matters for the priority of the styles if you are passing through styles to other components. IE:

```
// import order matters, because the useStyles in MyComponent now
// is after the useStyles import it will not take precedence if it has
// a styling conflict.
import useStyles from './SecondComponent.styles.ts';
import MyComponent from '../MyComponent/MyComponent.tsx';

const SecondComponent = () => {
    const styles = useStyles();

    return <MyComponent className={styles.overrideStyles} />
}
```

## Decision

We have decided to always place style imports as the last import in the file, so that any components that the file may use can safely be overriden with styles from the parent component.

```tsx
// Do:
import MyComponent from '../MyComponent/MyComponent.tsx';

import useStyles from './SecondComponent.styles.ts';

const SecondComponent = () => {
    const styles = useStyles();

    return <MyComponent className={styles.overrideStyles} />;
};

// Don't:
import useStyles from './SecondComponent.styles.ts';
import MyComponent from '../MyComponent/MyComponent.tsx';

const SecondComponent = () => {
    const styles = useStyles();

    return <MyComponent className={styles.overrideStyles} />;
};
```

The reason for this decision is to remove the posibillity for hard to find bugs, that are not obvious to detect and that might be time consuming to find a solution to.
