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
