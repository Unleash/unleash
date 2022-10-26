import { Knex } from 'knex';
import { Transactional } from 'lib/types/stores/transactional';

export const expectTransaction = (db: Knex | Knex.Transaction): void => {
    if (db.isTransaction) {
        return;
    }
    const isRunningInTest = process.env.NODE_ENV === 'test';
    const errorMessage =
        'A store method that was expected to be run in a transaction was run outside of a transaction';
    if (isRunningInTest) {
        throw new Error(errorMessage);
    } else {
        console.error(errorMessage);
    }
};

export abstract class Transactor<T> implements Transactional<T> {
    args: any[];

    // eslint-disable-next-line
    constructor(...args: any) {
        this.args = args;
    }

    transactional(transaction: Knex.Transaction): T {
        let clone = new (this.constructor as { new (...args: any[]): any })(
            ...this.args,
        );
        for (const attribute in this) {
            clone[attribute] = this[attribute];
        }
        clone.db = transaction;
        return clone as T;
    }

    expectTransaction(db: Knex | Knex.Transaction): void {
        expectTransaction(db);
    }
}

export type KnexTransaction = Knex.Transaction<any, any[]>;

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

export const createMockTransactionStarter =
    (): TransactionCreator<UnleashTransaction> => {
        function transaction<T>(
            scope: (trx: MockTransaction) => void | Promise<T>,
        ) {
            scope(null);
            return null;
        }
        return transaction;
    };
