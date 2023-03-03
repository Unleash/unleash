import { Knex } from 'knex';

export type KnexTransaction = Knex.Transaction;

export type MockTransaction = null;

export type UnleashTransaction = KnexTransaction | MockTransaction;

export type TransactionCreator<S> = <T>(
    scope: (trx: S) => void | Promise<T>,
) => Promise<T>;

export const createKnexTransactionStarter = (
    knex: Knex,
): TransactionCreator<UnleashTransaction> => {
    function transaction<T>(
        scope: (trx: KnexTransaction) => void | Promise<T>,
    ) {
        return knex.transaction(scope);
    }
    return transaction;
};
