import { Knex } from 'knex';
import { Transactional } from 'lib/types/stores/transactional';

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
}

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
