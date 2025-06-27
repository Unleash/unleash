import type { Knex } from 'knex';
import type { IUnleashConfig } from '../types/index.ts';
import { ulid } from 'ulidx';

export interface TransactionUserParams {
    type: 'change-request' | 'transaction';
    id: string;
}

function generateTransactionId(): string {
    return ulid();
}

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
        if (!knex) {
            console.warn(
                'It looks like your DB is not provided. Very often it is a test setup problem in setupAppWithCustomConfig',
            );
        }
        return knex.transaction(scope);
    }
    return transaction;
};

export type DeferredServiceFactory<S> = (db: Knex) => S;
/**
 * Services need to be instantiated with a knex instance on a per-transaction basis.
 * Limiting the input parameters, makes sure we don't inject already instantiated services
 * that might be bound to a different transaction.
 */
export type ServiceFactory<S> = (
    config: IUnleashConfig,
) => DeferredServiceFactory<S>;

export type WithTransactional<S> = S & {
    transactional: <R>(
        fn: (service: S) => R,
        transactionContext?: TransactionUserParams,
    ) => Promise<R>;
};

export type WithRollbackTransaction<S> = S & {
    rollbackTransaction: <R>(fn: (service: S) => R) => Promise<R>;
};

/**
 * @deprecated this is a temporary solution to deal with transactions at the store level.
 * Ideally, we should handle transactions at the service level (each service method should be transactional).
 * The controller should define the transactional scope as follows:
 * https://github.com/Unleash/unleash/blob/cb034976b93abc799df774858d716a49f645d669/src/lib/features/export-import-toggles/export-import-controller.ts#L206-L208
 *
 * To be able to use .transactional method, services should be instantiated like this:
 * https://github.com/Unleash/unleash/blob/cb034976b93abc799df774858d716a49f645d669/src/lib/services/index.ts#L282-L284
 *
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

    service.transactional = async <R>(
        fn: (service: S) => R,
        transactionContext?: TransactionUserParams,
    ) =>
        db.transaction(async (trx: Knex.Transaction) => {
            const defaultContext: TransactionUserParams = {
                type: 'transaction',
                id: generateTransactionId(),
            };

            trx.userParams = transactionContext || defaultContext;
            const transactionalService = serviceFactory(trx);
            return fn(transactionalService);
        });

    return service;
}

export function withRollbackTransaction<S>(
    serviceFactory: (db: Knex) => S,
    db: Knex,
): WithRollbackTransaction<S> {
    const service = serviceFactory(db) as WithRollbackTransaction<S>;

    service.rollbackTransaction = async <R>(fn: (service: S) => R) => {
        const trx = await db.transaction();
        try {
            const transactionService = serviceFactory(trx);
            const result = await fn(transactionService);
            return result;
        } finally {
            await trx.rollback();
        }
    };

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
