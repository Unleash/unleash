import {
    TransactionContext,
    type OperationContext,
} from './transactionContext.js';
import { vi } from 'vitest';

describe('TransactionContext', () => {
    let mockTransaction: any;

    beforeEach(() => {
        mockTransaction = {
            select: vi.fn(),
            insert: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            where: vi.fn(),
            commit: vi.fn(),
            rollback: vi.fn(),
            isTransaction: true,
        };
    });

    describe('constructor', () => {
        it('should create transaction context with default operation', () => {
            const txContext = new TransactionContext(mockTransaction);

            expect(txContext.operationContext.type).toBe('transaction');
            expect(txContext.operationContext.id).toBeDefined();
            expect(typeof txContext.operationContext.id).toBe('number');
            expect(txContext.transaction).toBe(mockTransaction);
        });

        it('should create transaction context with custom operation', () => {
            const customOperation: OperationContext = {
                type: 'change-request',
                id: 42,
            };

            const txContext = new TransactionContext(
                mockTransaction,
                customOperation,
            );

            expect(txContext.operationContext.type).toBe('change-request');
            expect(txContext.operationContext.id).toBe(42);
            expect(txContext.transaction).toBe(mockTransaction);
        });

        it('should create transaction context with partial operation context', () => {
            const txContext = new TransactionContext(mockTransaction, {
                type: 'change-request',
            });

            expect(txContext.operationContext.type).toBe('change-request');
            expect(txContext.operationContext.id).toBeDefined();
            expect(typeof txContext.operationContext.id).toBe('number');
            expect(txContext.transaction).toBe(mockTransaction);
        });

        it('should generate unique IDs for different contexts', () => {
            const txContext1 = new TransactionContext(mockTransaction);
            const txContext2 = new TransactionContext(mockTransaction);

            expect(txContext1.operationContext.id).not.toBe(
                txContext2.operationContext.id,
            );
        });
    });

    describe('operationContext', () => {
        it('should allow updating operation context', () => {
            const txContext = new TransactionContext(mockTransaction);

            expect(txContext.operationContext.type).toBe('transaction');

            txContext.operationContext = {
                type: 'change-request',
                id: 123,
            };

            expect(txContext.operationContext.type).toBe('change-request');
            expect(txContext.operationContext.id).toBe(123);
        });

        it('should allow partial updates to operation context', () => {
            const txContext = new TransactionContext(mockTransaction);
            const originalId = txContext.operationContext.id;

            Object.assign(txContext.operationContext, {
                type: 'change-request',
            });

            expect(txContext.operationContext.type).toBe('change-request');
            expect(txContext.operationContext.id).toBe(originalId);
        });
    });

    describe('transaction access', () => {
        it('should provide access to the underlying transaction', () => {
            const txContext = new TransactionContext(mockTransaction);

            expect(txContext.transaction).toBe(mockTransaction);
            expect(txContext.transaction.select).toBe(mockTransaction.select);
            expect(txContext.transaction.insert).toBe(mockTransaction.insert);
            expect(txContext.transaction.commit).toBe(mockTransaction.commit);
        });
    });
});
