---
title: "ADR: Domain language"
---

## Background

In the codebase, we have seen the need to define a domain language that we use to refer to features, methods to keep it consistent across the codebase. This ADR will contain a growing list of domain language used to keep the consistency across the codebase.

## Decision

We have decided to use the same domain language for the features we develop. Each feature will have it's own domain language to keep it consistent across the codebase.

## Change requests domain language

* *Change request*: An entity referring to the overarching data structure of a change request. A change request contains changes, and can be approved or rejected.
* *Change*: A term referring to a single change within a change request
* *Changes*: A term referring to a group of changes within a change request
* *Discard*: A term used for deleting a single change of a change request, or discarding an entire change request. 
* *Pending*: A *pending* change request is one that has not yet been applied or discarded. In other words, it is in one of these three states:
    1. `Draft`
    2. `In review`
    3. `Approved`
* *Closed*: A *closed* change request has either been applied or cancelled and can no longer be changed. Change requests that are either `Applied` or `Cancelled` are considered closed.

