---
title: Architectural Decision Records
---

## Introduction {#introduction}

Architectural decision records are a record of design decisions we have made in the past because we belived they would help our code quality over time. Any ADR can be challenged, but two conditions must be met to change an ADR: 
1. The proposed solution must provide a tangible benefit in terms of code quality.
2. The benefits of the proposed solution must outweigh the effort of retroactively changing the entire codebase. 
One such example is the decision to re-write Unleash to TypeScript.

## Overarching ADRs

These ADRs describe decisions that concern the entire codebase. They apply to back-end code, front-end code, and code that doesn't neatly fit into either of those categories.

* [Domain language](./general/ADR/domain-language.md)

## Back-end ADRs

We are currently in the process of defining ADRs for the backend, currently we have created the following ADRS:

* [Naming](./backend/ADR/naming.md)
* [Preferred export](./backend/ADR/preferred-export.md)

## Frontend ADRs

We have created a set of ADRs to help guide the development of the frontend:

* [Component naming](./frontend/ADR/component-naming.md)
* [Interface naming](./frontend/ADR/interface-naming.md)
* [Preferred component props usage](./frontend/ADR/preferred-component-props-usage.md)
* [Preferred export](./frontend/ADR/preferred-export.md)
* [Preferred function type](./frontend/ADR/preferred-function-type.md)
* [Preferred style import placement](./frontend/ADR/preferred-styles-import-placement.md)
* [Preferred styling method](./frontend/ADR/preferred-styling-method.md)
* [Preferred data mutation method](./frontend/ADR/preferred-data-mutation-method.md)
* [Preferred data fetching method](./frontend/ADR/preferred-data-fetching-method.md)
* [Preferred folder structure](./frontend/ADR/preferred-folder-structure.md)
* [Preferred form architecture](./frontend/ADR/preferred-form-architecture.md)