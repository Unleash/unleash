---
title: "ADR: Specificity in database column references"
---

## Background

We recently experienced an issue where a database migration that introduced a new column resulted in ambiguity errors in our application, which highlighted the need for clearer SQL query standards. Currently, our queries often reference columns without specifying their parent tables, leading to potential ambiguity in complex queries that join multiple tables. This issue becomes more pronounced during database schema changes and migrations, where ambiguity in column references can lead to hard-to-anticipate runtime errors.

## Decision

To mitigate these risks, we will adopt a standard of explicitly specifying the full table name or alias for each column in our SQL queries. This standard is not just about improving readability, but is crucial for avoiding ambiguity in queries, especially when performing joins between tables. The decision to use the full table name or an alias will be left to the discretion of the developer, with a focus on maximizing clarity and maintainability.

### Example: Preferred vs. discouraged syntax

To clarify the standards set out in the ADR, here's a quick comparison of the preferred syntax against the discouraged syntax, using hypothetical tables and columns:

**1. Preferred syntax: Explicit table naming**

```ts
const rows = await this.db
    .select(
        'u.id', 
        'u.name', 
        'u.email',
        'o.description',
    )
    .from('users as u')
    .join('orders as o', 'o.user_id', 'u.id')
    .where('o.status', 'active')
    .orderBy('o.created_at', 'desc')
```

**Why preferred**: Clearly indicates that `id`, `name`, and `email` are columns from the `users` table (aliased as `u`), and that `description`, `status` and `created_at` are from the `orders` table (aliased as `o`). This prevents ambiguity, especially useful in JOINs.

**Note**: Aliases (`u` for `users`, `o` for `orders`) are used here for brevity and readability, but they are optional. The key aspect is specifying the table for each column.

**2. Discouraged syntax: Implicit table naming**

```ts
const rows = await this.db
    .select(
        'id', 
        'name', 
        'email',
        'description',
    )
    .from('users')
    .join('orders', 'orders.user_id', 'users.id')
    .where('status', 'active')
    .orderBy('created_at', 'desc')
```

**Why discouraged**: Without specifying the table for each column, it becomes unclear which table each column belongs to. This ambiguity, especially in tables with identically named columns, can lead to runtime errors that are difficult to anticipate, particularly in queries involving joins.

### Advantages

The primary benefits of this approach are:

1. **Clarity and reduced ambiguity**: By explicitly specifying table names for each column, we eliminate ambiguity about which table a column belongs to. This is particularly beneficial in complex queries involving multiple tables and joins. This also reduces the risk of ambiguity errors during database migrations or schema changes.

2. **Ease of maintenance and adaptability to changes**: During database migrations or schema changes, specifically referenced columns make it easier to identify and update relevant queries. This reduces the risk of overlooking changes that might affect query behavior.

3. **Improved readability in complex queries**: In queries involving multiple tables and joins, explicitly specifying table names makes the query more readable and understandable, facilitating easier debugging and review, while ensuring consistency across the codebase.

### Concerns

The adoption of this practice comes with minimal concerns:

1. **Slight increase in verbosity**: The queries will be slightly longer due to the addition of table names in columns. However, the benefits in clarity and maintainability far outweigh this minor increase in verbosity.

2. **Initial adaptation curve**: There might be a brief period of adjustment as developers adapt to this new standard. However, given its straightforward nature, this learning curve is expected to be minimal.

## Conclusion

The adoption of explicit table name specification in our SQL queries is a strategic decision aimed at improving the clarity, maintainability, and reliability of our database interactions. This practice will ensure that our queries remain robust and clear, especially in the context of evolving database schemas and complex query scenarios. We will gradually implement this standard in our existing codebase by following the Girl Scout Rule. This change aligns with our commitment to writing clean, understandable, and maintainable code, thereby enhancing the overall quality of our software development processes.
