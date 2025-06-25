import { transactionContext } from './transactionContext.js';

describe('transactionContext', () => {
    describe('run', () => {
        it('should execute callback with transaction context', async () => {
            const result = await transactionContext.run(async () => {
                return 'callback-result';
            });

            expect(result).toBe('callback-result');
        });

        it('should make transaction context available inside the callback', async () => {
            await transactionContext.run(async () => {
                expect(transactionContext.getOperationType()).toBe(
                    'transaction',
                );
                expect(transactionContext.getOperationId()).toBeDefined();
                expect(typeof transactionContext.getOperationId()).toBe(
                    'number',
                );
            });
        });

        it('should generate unique numeric transaction IDs', async () => {
            const ids: (string | number | undefined)[] = [];

            await transactionContext.run(async () => {
                ids.push(transactionContext.getOperationId());
            });

            await transactionContext.run(async () => {
                ids.push(transactionContext.getOperationId());
            });

            expect(ids).toHaveLength(2);
            expect(ids[0]).not.toBe(ids[1]);
            expect(typeof ids[0]).toBe('number');
            expect(typeof ids[1]).toBe('number');
        });

        it('should handle rejected promises', async () => {
            const error = new Error('Test error');

            await expect(
                transactionContext.run(async () => {
                    throw error;
                }),
            ).rejects.toThrow('Test error');
        });

        it('should handle nested transaction contexts', async () => {
            let outerOperationId: string | number | undefined;
            let innerOperationId: string | number | undefined;

            await transactionContext.run(async () => {
                outerOperationId = transactionContext.getOperationId();
                expect(transactionContext.getOperationType()).toBe(
                    'transaction',
                );

                await transactionContext.run(async () => {
                    innerOperationId = transactionContext.getOperationId();
                    expect(transactionContext.getOperationType()).toBe(
                        'transaction',
                    );
                });

                expect(transactionContext.getOperationId()).toBe(
                    outerOperationId,
                );
            });

            expect(outerOperationId).toBeDefined();
            expect(innerOperationId).toBeDefined();
            expect(outerOperationId).not.toBe(innerOperationId);
        });
    });

    describe('getOperation', () => {
        it('should return undefined when called outside of transaction context', () => {
            expect(transactionContext.getOperation()).toBeUndefined();
        });

        it('should return the operation context when called inside context', async () => {
            await transactionContext.run(async () => {
                const operation = transactionContext.getOperation();
                expect(operation).toBeDefined();
                expect(operation?.type).toBe('transaction');
                expect(operation?.id).toBeDefined();
                expect(typeof operation?.id).toBe('number');
            });
        });
    });

    describe('getOperationType', () => {
        it('should return undefined when called outside of transaction context', () => {
            expect(transactionContext.getOperationType()).toBeUndefined();
        });

        it('should return "transaction" when called inside context', async () => {
            await transactionContext.run(async () => {
                expect(transactionContext.getOperationType()).toBe(
                    'transaction',
                );
            });
        });
    });

    describe('getOperationId', () => {
        it('should return undefined when called outside of transaction context', () => {
            expect(transactionContext.getOperationId()).toBeUndefined();
        });

        it('should return numeric ID when called inside context', async () => {
            await transactionContext.run(async () => {
                const id = transactionContext.getOperationId();
                expect(id).toBeDefined();
                expect(typeof id).toBe('number');
            });
        });
    });

    describe('setOperation', () => {
        it('should throw error when called outside of transaction context', () => {
            expect(() => {
                transactionContext.setOperation({
                    type: 'change-request',
                    id: 123,
                });
            }).toThrow(
                'No active transaction context found when setting operation',
            );
        });

        it('should set operation context in active context', async () => {
            await transactionContext.run(async () => {
                expect(transactionContext.getOperationType()).toBe(
                    'transaction',
                );

                transactionContext.setOperation({
                    type: 'change-request',
                    id: 456,
                });

                expect(transactionContext.getOperationType()).toBe(
                    'change-request',
                );
                expect(transactionContext.getOperationId()).toBe(456);
            });
        });

        it('should update existing operation context', async () => {
            await transactionContext.run(async () => {
                expect(transactionContext.getOperationType()).toBe(
                    'transaction',
                );
                const originalId = transactionContext.getOperationId();

                transactionContext.setOperation({
                    type: 'change-request',
                    id: 789,
                });

                expect(transactionContext.getOperationType()).toBe(
                    'change-request',
                );
                expect(transactionContext.getOperationId()).toBe(789);
                expect(transactionContext.getOperationId()).not.toBe(
                    originalId,
                );
            });
        });

        it('should not affect transaction context after callback completes', async () => {
            await transactionContext.run(async () => {
                transactionContext.setOperation({
                    type: 'change-request',
                    id: 999,
                });
                expect(transactionContext.getOperationType()).toBe(
                    'change-request',
                );
                expect(transactionContext.getOperationId()).toBe(999);
            });

            expect(transactionContext.getOperation()).toBeUndefined();
        });
    });
});
