---
title: "ADR: Deprecation of `<ConditionallyRender />` Component"
---

## Background

Using the `&&` operator in React can lead to unexpected rendering behavior when dealing with certain falsy values. In our codebase, the `<ConditionallyRender />` component has been used to render React elements based on a boolean condition. It has some certain drawbacks, and that's why we would like to replace it with ternary operator.

### Pitfalls of `&&` operator

While most truthy and falsy values behave as expected with the `&&` operator, certain falsy values can produce unintended outcomes:

```tsx
{NaN && <p>❔</p>} // will render `NaN`
{0 && <p>❔</p>} // will render `0`
{arr?.length && <p>❔</p>} // can render `0` ❗
```

These issues can cause bugs in components that conditionally render UI elements based on numeric values or other potentially falsy conditions. For this reason we use a wrapper.

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
It's easier to spot nested ternaries, then nested `<ConditionallyRender />` elements.

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

#### Minor performance hit
<!-- TODO: PoC -->

## Options considered

To avoid these issues, safer alternatives to the `&&` operator can be used:

### **Convert to boolean**
This approach explicitly converts the condition to a boolean value using `Boolean(expression)` or `!!expression`, ensuring that only `true` or `false` determine the rendering.

```tsx
{Boolean(NaN) && <p>❔</p>}  // Won't render anything
{!!0 && <p>❔</p>}           // Also safe
```

❌ **Unfortunately** Biome (linter we use) does not include rules to automatically enforce safer usage of the `&&` operator, as ESLint did.

### Ternary Operator
The ternary operator is a more explicit and safer approach. This will cover some cases where we have to return `null` or `undefined`.

``` tsx
{NaN ? <p>👍</p> : null}  // ✅ Won't render anything
```

It also plays nicely with TypeScript.

```tsx
export const Test: FC<{ maybeString?: string }> = ({ maybeString }) =>
    maybeString ? <SubComponent text={maybeString} /> : null; // ✅
```


This is what we will use from now onwards.

