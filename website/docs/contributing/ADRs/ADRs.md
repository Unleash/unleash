---
title: ADR Overview
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

We are in the process of defining ADRs for the back end. At the time of writing we have created the following ADRS:

* [Naming](./back-end/ADR/naming.md)
* [Preferred export](./back-end/ADR/preferred-export.md)

## Front-end ADRs

We have created a set of ADRs to help guide the development of the front end:

* [Component naming](./front-end/ADR/component-naming.md)
* [Interface naming](./front-end/ADR/interface-naming.md)
* [Preferred component props usage](./front-end/ADR/preferred-component-props-usage.md)
* [Preferred export](./front-end/ADR/preferred-export.md)
* [Preferred function type](./front-end/ADR/preferred-function-type.md)
* [Preferred style import placement](./front-end/ADR/preferred-styles-import-placement.md)
* [Preferred styling method](./front-end/ADR/preferred-styling-method.md)
* [Preferred data mutation method](./front-end/ADR/preferred-data-mutation-method.md)
* [Preferred data fetching method](./front-end/ADR/preferred-data-fetching-method.md)
* [Preferred folder structure](./front-end/ADR/preferred-folder-structure.md)
* [Preferred form architecture](./front-end/ADR/preferred-form-architecture.md)