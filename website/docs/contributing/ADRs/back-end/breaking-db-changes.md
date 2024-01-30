---
title: "ADR: Breaking DB changes"
---

## Background

During the evolution of a feature different clients may use different version of code e.g. behind a feature flag.
If the code relies on breaking DB changes (column delete, table rename, deleting DB entries etc.) it may lead to errors.

The very same problem occurs when you apply a breaking migration just before the new version of the application starts e.g. during a zero-downtime deployment (whatever strategy you use).
The code is still running against the old schema as the migration takes a few seconds to apply.

## Decision
To address these challenges, follow these guidelines:

### Avoid Breaking DB Changes
- **Prioritize avoiding breaking changes** in the DB schema whenever possible.

### Use the "Expand/Contract" Pattern
If breaking changes are inevitable, use the "expand/contract" pattern:

#### Expand Phase
- **Maintain both old and new DB schemas** in parallel.
- Ensure **code compatibility with both schemas**.
- Keep dual compatibility for **at least 2 minor releases**, allowing client upgrades.
- This approach also supports **downgrading within this version range** without reverting migrations.

#### Contract Phase
- **Remove the old DB schema** once no clients use the old version.

### Code Reviewer Responsibilities
- **Action for a Code Reviewer:** When you spot a migration with `ALTER TABLE DROP COLUMN` or `ALTER TABLE RENAME TO`, please raise a flag if the "expand phase" was missed.


### Separate Migrations as Distinct PRs
- Carry out all migrations in **separate pull requests (PRs)** and closely monitor them during deployment. Monitoring should be performed using Grafana, observing any failing requests or errors in the logs.

### Primary Key Requirement for New Tables
- All new tables must have a primary key to ensure data integrity, improve query efficiency, and establish foreign key relationships. Primary keys also address migration issues in replicated databases without PostgreSQL replica identities. Exceptions require strong justification.

Following these guidelines reduces the risk of errors and compatibility issues during DB schema changes, enhancing stability and reliability in software development.
