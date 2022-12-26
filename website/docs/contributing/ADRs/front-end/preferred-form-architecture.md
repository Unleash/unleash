---
title: "ADR: Preferred form architecture"
---

## Background

Forms can be tricky. In software, we often want to write DRY components, repeating as little as possible. Yet we also want a clear separation of concerns. Forms represent a challenge in this way because you have to choose which principle is the most important. You can't both have it DRY and completely separated.

## Decision

We have decided to architecture our forms in the following way: 

* Create a hook that contains all the logic for the form. This hook will return a form object that contains all the form state and functions to update the state.
* Create a reusable form component that does not contain any logic
* Create separate Create and Edit components that use the form component and the form hook to create the form and implements it's own logic for submitting the form.

In this way, we keep as much of the form as possible DRY, but we avoid passing state internally in the form so the form doesn't need to know whether it is in create or edit mode. This allows us to keep one thing in mind when working, and not have to worry about dual states of the component.
