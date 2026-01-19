---
title: ADR Overview
---

## Introduction

Architectural decision records are a record of design decisions we have made in the past because we belived they would help our code quality over time. Any ADR can be challenged, but two conditions must be met to change an ADR: 
1. The proposed solution must provide a tangible benefit in terms of code quality.
2. The benefits of the proposed solution must outweigh the effort of retroactively changing the entire codebase. 
One such example is the decision to re-write Unleash to TypeScript.

## Overarching ADRs

These ADRs describe decisions that concern the entire codebase. They apply to back-end code, front-end code, and code that doesn't neatly fit into either of those categories.

* [Domain language](/contributing/ADRs/overarching/domain-language)
* [Separation of request and response schemas](/contributing/ADRs/overarching/separation-request-response-schemas)
* [Error Logging stack traces](/contributing/ADRs/overarching/logging)
* [Logging levels](/contributing/ADRs/overarching/logging-levels)

## Back-end ADRs

We are in the process of defining ADRs for the back end. At the time of writing we have created the following ADRS:

* [Naming](/contributing/ADRs/back-end/naming)
* [Preferred export](/contributing/ADRs/back-end/preferred-export)
* [Breaking DB changes](/contributing/ADRs/back-end/breaking-db-changes)
* [POST/PUT API payload](/contributing/ADRs/back-end/POST-PUT-api-payload)
* [Specificity in database column references](/contributing/ADRs/back-end/specificity-db-columns)
* [Write model vs Read models](/contributing/ADRs/back-end/write-model-vs-read-models)
* [Frontend API Design](/contributing/ADRs/back-end/frontend-api-design)
* [Correct type dependencies](/contributing/ADRs/back-end/correct-type-dependencies)

## Front-end ADRs

We have created a set of ADRs to help guide the development of the front end:

* [Component naming](/contributing/ADRs/front-end/component-naming)
* [Interface naming](/contributing/ADRs/front-end/interface-naming)
* [Preferred component props usage](/contributing/ADRs/front-end/preferred-component-props-usage)
* [Preferred export](/contributing/ADRs/front-end/preferred-export)
* [Preferred function type](/contributing/ADRs/front-end/preferred-function-type)
* [Preferred styling method](/contributing/ADRs/front-end/preferred-styling-method)
* [Preferred data mutation method](/contributing/ADRs/front-end/preferred-data-mutation-method)
* [Preferred data fetching method](/contributing/ADRs/front-end/preferred-data-fetching-method)
* [Preferred folder structure](/contributing/ADRs/front-end/preferred-folder-structure)
* [Preferred form architecture](/contributing/ADRs/front-end/preferred-form-architecture)
* [OpenAPI SDK generator](/contributing/ADRs/front-end/sdk-generator)
* [Use of conditionals in JSX (refactor of &lt;ConditionallyRender /&gt;)](/contributing/ADRs/front-end/jsx-conditionals)
