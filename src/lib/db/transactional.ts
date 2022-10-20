import { Knex } from 'knex';
import { Transactional } from 'lib/types/stores/transactional';

export abstract class AbstractTransactional<T> implements Transactional<T> {
    transactional(transaction: Knex.Transaction): T {
        let clone = new (this.constructor as { new (): any })();
        for (const attribute in this) {
            clone[attribute] = this[attribute];
        }
        clone.db = transaction;
        return clone as T;
    }
}
