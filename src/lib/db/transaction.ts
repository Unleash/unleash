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

export type DbServiceFactory<S> = (db: Knex) => S;
export type WithTransactional<S> = S & {
    transactional: <R>(fn: (service: S) => R) => Promise<R>;
};

/**
 * This function makes sure that `fn` is executed in a transaction.
 * If the db is already in a transaction, it will execute `fn` in that transactional scope.
 *
 * https://github.com/knex/knex/blob/bbbe4d4637b3838e4a297a457460cd2c76a700d5/lib/knex-builder/make-knex.js#L143C5-L144C88
 */
export async function inTransaction<R>(
    db: Knex,
    fn: (db: Knex) => R,
): Promise<R> {
    if (db.isTransaction) {
        return fn(db);
    }
    return db.transaction(async (tx) => fn(tx));
}

export function withTransactional<S>(
    serviceFactory: (db: Knex) => S,
    db: Knex,
): WithTransactional<S> {
    const service = serviceFactory(db) as WithTransactional<S>;

    service.transactional = async <R>(fn: (service: S) => R) =>
        // Maybe: inTransaction(db, async () => {
        db.transaction(async (trx: Knex.Transaction) => {
            const transactionalService = serviceFactory(trx);
            return fn(transactionalService);
        });

    return service;
}

/** Just for testing purposes */
export function withFakeTransactional<S>(service: S): WithTransactional<S> {
    const serviceWithFakeTransactional = service as WithTransactional<S>;

    serviceWithFakeTransactional.transactional = async <R>(
        fn: (service: S) => R,
    ) => fn(serviceWithFakeTransactional);

    return serviceWithFakeTransactional;
}
