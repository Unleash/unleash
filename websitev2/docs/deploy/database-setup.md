---
id: database-setup
title: Database Setup
---

To run Unleash you need to have PostgreSQL database (PostgreSQL v10.x or newer).

1. Create a local unleash databases in PostgreSQL

```bash
$ psql postgres <<SQL
CREATE USER unleash_user WITH PASSWORD 'password';
CREATE DATABASE unleash;
GRANT ALL PRIVILEGES ON DATABASE unleash to unleash_user;
SQL
```

You will now have a PostgreSQL database with the following configuration:

- database name: `unleash`
- username: `unleash_user`
- password: `password`
- host: `localhost` (assuming you started it locally)
- port: `5432` (assuming you are using the default PostgreSQL port)
