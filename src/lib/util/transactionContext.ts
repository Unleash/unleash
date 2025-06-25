import { AsyncLocalStorage } from 'async_hooks';

export interface OperationContext {
    type: 'change-request' | 'transaction';
    id: number;
}

function generateNumericTransactionId(): number {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return timestamp * 1000 + random;
}

const storage = new AsyncLocalStorage<OperationContext>();

export const transactionContext = {
    run<T>(callback: () => Promise<T>): Promise<T> {
        const data: OperationContext = {
            type: 'transaction',
            id: generateNumericTransactionId(),
        };
        return storage.run(data, callback) as Promise<T>;
    },

    getOperation(): OperationContext | undefined {
        return storage.getStore();
    },

    getOperationType(): OperationContext['type'] | undefined {
        return storage.getStore()?.type;
    },

    getOperationId(): number | undefined {
        return storage.getStore()?.id;
    },

    setOperation(operation: OperationContext): void {
        const store = storage.getStore();
        if (store) {
            store.id = operation.id;
            store.type = operation.type;
        } else {
            throw new Error(
                'No active transaction context found when setting operation',
            );
        }
    },
};
