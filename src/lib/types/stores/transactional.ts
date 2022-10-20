import { Knex } from 'knex';

export interface Transactional<T> {
    transactional(transaction: Knex.Transaction): T;
}
