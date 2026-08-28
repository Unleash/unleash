---
title: "ADR: SQL and migration standards"
---

## Background

Over time we have accumulated a small set of recurring review comments on database migrations and SQL. Each highlighted issue has caused (or can cause) real problems in production. 

## Decision

### Migrations

#### Create tables and indexes idempotently

`IF NOT EXISTS` makes the migration idempotent — re-running it against a database where the table or index already exists is a no-op instead of a failure. 

```sql
-- Preferred
CREATE TABLE IF NOT EXISTS safeguards (...);
CREATE INDEX IF NOT EXISTS safeguards_feature_name_idx ON safeguards(feature_name);

-- Discouraged
CREATE TABLE safeguards (...);
CREATE INDEX safeguards_feature_name_idx ON safeguards(feature_name);
```

#### Use `TEXT` instead of `VARCHAR`

In PostgreSQL, `TEXT` and `VARCHAR` have identical performance and storage. A `VARCHAR(n)` limit is rarely a real business constraint, and changing it later requires an `ALTER TABLE` and a coordinated deploy. Validate length at the application layer instead.

```sql
-- Preferred
name TEXT NOT NULL

-- Discouraged
name VARCHAR(255) NOT NULL
```

#### Use `TIMESTAMP WITH TIME ZONE`

A bare `TIMESTAMP` (without time zone) stores a wall-clock value with no information about which time zone it was recorded in, which makes the data ambiguous the moment servers or clients run in different zones. `TIMESTAMP WITH TIME ZONE` (`timestamptz`) stores an unambiguous instant.

```sql
-- Preferred
created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()

-- Discouraged
created_at TIMESTAMP NOT NULL DEFAULT now()
```

#### Do not use `SERIAL` / `BIGSERIAL`

Prefer app-generated IDs (ULID stored as `TEXT`). If a DB-generated integer ID is genuinely needed, use identity columns — the SQL standard without `SERIAL`'s sequence-ownership quirks.

```sql
-- Preferred: app-generated ULID
id TEXT PRIMARY KEY

-- Acceptable when a DB-generated integer ID is needed
id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY

-- Discouraged
id SERIAL PRIMARY KEY
```

### Queries

#### Do not use `BETWEEN`

`BETWEEN` is inclusive at **both** ends, so adjacent ranges double-count the boundary value (midnight rows land in both buckets). Use an explicit half-open interval instead.

```sql
-- Preferred
WHERE created_at >= '2024-01-01' AND created_at < '2024-02-01'

-- Discouraged
WHERE created_at BETWEEN '2024-01-01' AND '2024-02-01'
```
