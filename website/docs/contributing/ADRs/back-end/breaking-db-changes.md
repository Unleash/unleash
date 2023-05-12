---
title: "ADR: Breaking DB changes"
---

## Background

During the evolution of a feature different clients may use different version of code e.g. behind a feature flag.
If the code relies on breaking DB changes (column delete, table rename, deleting DB entries etc.) it may lead to errors.

The very same problem occurs when you apply a breaking migration just before the new version of the application starts e.g. during a zero-downtime deployment (whatever strategy you use).
The code is still running against the old schema as the migration takes a few seconds to apply.

## Decision

First please make sure to avoid breaking DB changes in the first place if possible.

If breaking change is inevitable please use the "expand/contract" pattern. 

In the "expand phase":
* maintain old and new DB schema in parallel
* maintain code that works with old and new DB schema
* keep it for 2 minor releases to give all clients a chance to upgrade the code
* with a fallback of 2 version we can also downgrade in this range without running down migrations

In the "contract phase":
* remove the old schema when you know that no client is using the old version

Action for a code reviewer:
* when you spot a migration with `ALTER table DROP COLUMN` or `ALTER table RENAME TO` please raise a flag if the "expand phase" was missed
