import type { Knex } from 'knex';

export type Db = Knex | Knex.Transaction;
