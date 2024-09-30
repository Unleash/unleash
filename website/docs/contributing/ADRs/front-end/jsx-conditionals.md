---
title: "ADR: Use of conditionals in JSX (deprecation of `<ConditionallyRender />`)"
---

## Background

Using the `&&` operator in React can lead to unexpected rendering behavior when dealing with certain falsy values. In our codebase, the `<ConditionallyRender />` component has been used to render React elements based on a boolean condition. However, it has certain drawbacks, which is why we would like to replace it with the ternary operator.

### Pitfalls of `&&` operator

While most truthy and falsy values behave as expected with the `&&` operator, certain falsy values can produce unintended outcomes:

```tsx
{NaN && <p>❔</p>} // will render `NaN`
{0 && <p>❔</p>} // will render `0`
{arr?.length && <p>❔</p>} // can render `0`
```

These issues can cause bugs in components that conditionally render UI elements based on numeric values or other potentially falsy conditions. For this reason, we use a wrapper.

```tsx
<ConditionallyRender
    condition={arr?.length}
    show={<p>❔</p>}
/>
```

### What's wrong with `<ConditionallyRender />`

While this solves leaking render issues, it has some drawbacks.

#### Poor TypeScript support
```tsx
import type { FC } from 'react';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

const SubComponent: FC<{ text: string }> = ({ text }) => <>{text}</>;

export const Test: FC<{ maybeString?: string }> = ({ maybeString }) => (
    <ConditionallyRender
        condition={maybeString}
        // ❌ TS Error: Type 'string | undefined' is not assignable to type 'boolean'
        // You have to use `Boolean(maybeString)`

        show={<SubComponent text={maybeString} />}
        // ❌ TS Error: Type 'string | undefined' is not assignable to type 'string'
        // you have to use `maybeString!` here
    />
);
```

#### Obfuscation of code smells and code cruft
Nested ternaries are easier to spot than nested `<ConditionallyRender />` elements.

```tsx
<div>
    <ConditionallyRender
        condition={Boolean(a)} 
        show={(
            <ConditionallyRender
                condition={Boolean(b)}
                show={<p>This is bad</p>}
            />
        )}
        elseShow={'Should be refactored'}
    />
</div>
```

Nested operator does not look like other JSX components.

```tsx
<div>
    {a ? (
        b ? <p>This is bad</p> : null
    ) : 'Should be refactored'}
</div>
```

## Options considered

To avoid these issues, safer alternatives to the `&&` operator can be used:

### **Convert to boolean**
We could try to explicitly convert the condition to a boolean, ensuring that only `true` or `false` determine the rendering.

```tsx
{Boolean(NaN) && <p>❔</p>}  // Won't render anything
{!!0 && <p>❔</p>}           // Also safe
```

**Unfortunately** Biome (the linter we use) does not include rules to automatically enforce a safer usage of the `&&` operator, as ESLint did.

### Ternary Operator
The ternary operator is a more explicit and safer approach. This covers cases where we need to return `null` or `undefined`.

``` tsx
{NaN ? <p>👍</p> : null}  // Won't render anything
```

It also plays nicely with TypeScript.

```tsx
export const Test: FC<{ maybeString?: string }> = ({ maybeString }) =>
    maybeString ? <SubComponent text={maybeString} /> : null;
```

This is what we will use from now onwards.

## Consequences
Positive: The codebase will become more type-safe and easier to understand.

Negative: The `<ConditionallyRender />` component is imported in nearly 400 files. Significant refactoring effort is required.

Performance: There was no measurable performance difference between code with and without this component. This was tested on production bundle, on the features search (table) and projects list pages.

## Migration plan

1. Mark `<ConditionallyRender />` as deprecated in the codebase with a clear JSDoc comment.

2. Automated refactoring with AST (Abstract Syntax Tree):
There already is a script developed that can convert files between `ConditionallyRender` and ternary syntax. It uses jscodeshift, a library. It will be put in `frontend/scripts/transform.js`.

3. Each change will have to be reviewed. The order of refactoring should be:
    1. New features that are behind feature flags.
    2. Non-critical or not in demand pages, like new signals or feedback component.
    3. Less complex pages, for example in `/src/component/admin`.
    4. More complex and critical pages, like strategy editing.
    5. Utilities and components used in many places (`/src/component/common`).

4. Once all instances of `<ConditionallyRender />` have been refactored, remove the component from the codebase.
