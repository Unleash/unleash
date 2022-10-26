import { UnleashTransaction } from 'lib/db/transactional';

export interface Transactional<T> {
    transactional(transaction: UnleashTransaction): T;
}
