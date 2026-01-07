import {
    withTransactional,
    withRollbackTransaction,
    withFakeTransactional,
    inTransaction,
    type TransactionUserParams,
} from './transaction.js';
import { type Mock, vi } from 'vitest';

interface MockService {
    getData: () => string;
    saveData: (data: string) => Promise<void>;
}

describe('transaction utilities', () => {
    let mockDb: any;
    let mockTransaction: any;
    let mockServiceFactory: Mock;
    let mockService: MockService;

    beforeEach(() => {
        mockTransaction = {
            commit: vi.fn(),
            rollback: vi.fn(),
            isTransaction: true,
            select: vi.fn(),
            insert: vi.fn(),
            update: vi.fn(),
            userParams: undefined,
        };

        mockDb = {
            transaction: vi
                .fn()
                .mockImplementation((callback) => callback(mockTransaction)),
            isTransaction: false,
        };

        mockService = {
            getData: vi.fn().mockReturnValue('test-data'),
            saveData: vi.fn().mockResolvedValue(undefined),
        };

        mockServiceFactory = vi.fn().mockReturnValue(mockService);
    });

    describe('withTransactional', () => {
        it('should add transactional method to service', () => {
            const serviceWithTransactional = withTransactional(
                mockServiceFactory,
                mockDb,
            );

            expect(typeof serviceWithTransactional.transactional).toBe(
                'function',
            );
            expect(serviceWithTransactional.getData).toBe(mockService.getData);
            expect(serviceWithTransactional.saveData).toBe(
                mockService.saveData,
            );
        });

        it('should execute callback within database transaction', async () => {
            const serviceWithTransactional = withTransactional(
                mockServiceFactory,
                mockDb,
            );

            const result = await serviceWithTransactional.transactional(
                (service) => {
                    return service.getData();
                },
            );

            expect(mockDb.transaction).toHaveBeenCalledTimes(1);
            expect(result).toBe('test-data');
        });

        it('should set default userParams when no transactionContext provided', async () => {
            const serviceWithTransactional = withTransactional(
                mockServiceFactory,
                mockDb,
            );

            await serviceWithTransactional.transactional((service) => {
                return service.getData();
            });

            expect(mockTransaction.userParams).toBeDefined();
            expect(mockTransaction.userParams.type).toBe('transaction');
            expect(mockTransaction.userParams.id).toBeDefined();
            expect(typeof mockTransaction.userParams.id).toBe('string');
        });

        it('should use provided transactionContext when given', async () => {
            const serviceWithTransactional = withTransactional(
                mockServiceFactory,
                mockDb,
            );
            const customContext: TransactionUserParams = {
                type: 'change-request',
                id: '01HQVX5K8P9EXAMPLE123456',
            };

            await serviceWithTransactional.transactional((service) => {
                return service.getData();
            }, customContext);

            expect(mockTransaction.userParams).toEqual(customContext);
            expect(mockTransaction.userParams.type).toBe('change-request');
            expect(mockTransaction.userParams.id).toBe(
                '01HQVX5K8P9EXAMPLE123456',
            );
        });

        it('should generate unique ULID strings for default context', async () => {
            const serviceWithTransactional = withTransactional(
                mockServiceFactory,
                mockDb,
            );
            const userParamsIds: string[] = [];

            for (let i = 0; i < 3; i++) {
                await serviceWithTransactional.transactional((service) => {
                    userParamsIds.push(mockTransaction.userParams.id);
                    return service.getData();
                });
            }

            expect(userParamsIds).toHaveLength(3);
            expect(userParamsIds.every((id) => typeof id === 'string')).toBe(
                true,
            );
            expect(new Set(userParamsIds).size).toBe(3);
            userParamsIds.forEach((id) => {
                expect(id).toMatch(/^[0-9A-HJKMNP-TV-Z]{26}$/);
            });
        });

        it('should create transactional service with transaction instance', async () => {
            const serviceWithTransactional = withTransactional(
                mockServiceFactory,
                mockDb,
            );

            await serviceWithTransactional.transactional((service) => {
                return service.getData();
            });

            expect(mockServiceFactory).toHaveBeenCalledWith(mockTransaction);
        });

        it('should handle promise-based callbacks', async () => {
            const serviceWithTransactional = withTransactional(
                mockServiceFactory,
                mockDb,
            );

            const result = await serviceWithTransactional.transactional(
                async (service) => {
                    await service.saveData('new-data');
                    return 'success';
                },
            );

            expect(result).toBe('success');
            expect(mockService.saveData).toHaveBeenCalledWith('new-data');
        });

        it('should propagate errors from callback', async () => {
            const serviceWithTransactional = withTransactional(
                mockServiceFactory,
                mockDb,
            );
            const error = new Error('Test error');

            await expect(
                serviceWithTransactional.transactional(() => {
                    throw error;
                }),
            ).rejects.toThrow('Test error');
        });
    });

    describe('withRollbackTransaction', () => {
        beforeEach(() => {
            mockDb.transaction = vi.fn().mockResolvedValue(mockTransaction);
        });

        it('should add rollbackTransaction method to service', () => {
            const serviceWithRollback = withRollbackTransaction(
                mockServiceFactory,
                mockDb,
            );

            expect(typeof serviceWithRollback.rollbackTransaction).toBe(
                'function',
            );
            expect(serviceWithRollback.getData).toBe(mockService.getData);
            expect(serviceWithRollback.saveData).toBe(mockService.saveData);
        });

        it('should execute callback and rollback transaction', async () => {
            const serviceWithRollback = withRollbackTransaction(
                mockServiceFactory,
                mockDb,
            );

            const result = await serviceWithRollback.rollbackTransaction(
                (service) => {
                    return service.getData();
                },
            );

            expect(mockDb.transaction).toHaveBeenCalledTimes(1);
            expect(mockTransaction.rollback).toHaveBeenCalledTimes(1);
            expect(result).toBe('test-data');
        });
    });

    describe('withFakeTransactional', () => {
        it('should add transactional method to service', () => {
            const serviceWithFakeTransactional =
                withFakeTransactional(mockService);

            expect(typeof serviceWithFakeTransactional.transactional).toBe(
                'function',
            );
            expect(serviceWithFakeTransactional.getData).toBe(
                mockService.getData,
            );
            expect(serviceWithFakeTransactional.saveData).toBe(
                mockService.saveData,
            );
        });

        it('should execute callback directly without transaction', async () => {
            const serviceWithFakeTransactional =
                withFakeTransactional(mockService);

            const result = await serviceWithFakeTransactional.transactional(
                (service) => {
                    return service.getData();
                },
            );

            expect(result).toBe('test-data');
        });
    });

    describe('inTransaction', () => {
        it('should execute callback directly when db is already a transaction', async () => {
            const transactionDb = { ...mockDb, isTransaction: true };
            const callback = vi.fn().mockReturnValue('result');

            const result = await inTransaction(transactionDb, callback);

            expect(result).toBe('result');
            expect(callback).toHaveBeenCalledWith(transactionDb);
            expect(transactionDb.transaction).not.toHaveBeenCalled();
        });

        it('should create new transaction when db is not a transaction', async () => {
            const callback = vi.fn().mockReturnValue('result');

            const result = await inTransaction(mockDb, callback);

            expect(result).toBe('result');
            expect(mockDb.transaction).toHaveBeenCalledTimes(1);
            expect(callback).toHaveBeenCalledWith(mockTransaction);
        });
    });
});
