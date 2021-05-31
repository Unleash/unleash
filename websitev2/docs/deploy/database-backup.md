---
id: database_backup
title: Database Backup
---

When upgrading to a new major version of Unleash, we advise to do a full database backup to ease rollback in case of failures.

1. Create a database backup:

```
pg_dump --clean -U unleash_user -W -h localhost unleash > unleash-db.dump

```

2. Restore from a backup:

```
psql -U unleash_user -W -h localhost unleash < unleash-db.dump
```
