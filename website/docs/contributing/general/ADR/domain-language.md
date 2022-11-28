---
title: "ADR: Domain language"
---

## Background

In the codebase, we have seen the need to define a domain language that we use to refer to features, methods to keep it consistent across the codebase. This ADR will contain a growing list of domain language used to keep the consistency across the codebase.

## Decision

We have decided to use the same domain language for the features we develop. Each feature will have it's own domain language to keep it consistent across the codebase.

## Change requests domain language

* *Change request*

An entity referring to the overarching data structure of a change request. A change request contains changes, and can be approved or rejected.

* *Changes*

An entity referring to a single change within a change request

* *Discard*

A naming convention used for deleting a single change of a change request, or discarding an entire change request

* *Pending*

A naming convention used to describe a change requests state. A pending change request is in one of these three states: `Draft | In review | Approved`

* *Closed*

A *closed* change request has either been applied or cancelled and can no longer be changed. Change requests that are either `Applied` or `Cancelled` are considered closed.

