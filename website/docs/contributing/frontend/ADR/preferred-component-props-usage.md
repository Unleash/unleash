---
title: "ADR: Preferred component props usage"
---

## Background

In the codebase, we have found a need to standardise how to use props, in order to easily be able to figure out what a component is doing and what properties it is given without having to look up the interface.

## Decision

We have decided to use props destructuring inline in components in order to quickly display what properties a component is using.

```tsx
// Do:
const MyComponent = ({ name, age, occupation }: IComponentProps) => {
    return (
        <div>
            <p>{age}</p>
            <p>{name}</p>
            <p>{occupation}</p>
        </>
    )
};

// Don't:
function MyComponent(props) {
       return (
        <div>
            <p>{props.age}</p>
            <p>{props.name}</p>
            <p>{props.occupation}</p>
        </>
    )
}
```

The reason for this decision is to remove mental clutter and free up capacity to easily navigate the codebase. In addition, when components grow, the ability to look at the signature and instantly know what dependencies this component uses gives you an advantage when scanning the codebase.
