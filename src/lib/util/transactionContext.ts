import type { Knex } from 'knex';

export interface OperationContext {
    type: 'change-request' | 'transaction';
    id: number;
}

function generateNumericTransactionId(): number {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return timestamp * 1000 + random;
}

export class TransactionContext {
    public readonly transaction: Knex.Transaction;
    public operationContext: OperationContext;

    constructor(
        transaction: Knex.Transaction,
        operationContext?: Partial<OperationContext>,
    ) {
        this.transaction = transaction;
        this.operationContext = {
            type: operationContext?.type || 'transaction',
            id: operationContext?.id || generateNumericTransactionId(),
        };
    }
}
