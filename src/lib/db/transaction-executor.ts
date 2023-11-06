import { Knex } from 'knex';

export class TransactionExecutor {
    private db: Knex;
    private maxRetries: number;

    constructor(db: Knex, maxRetries: number = 3) {
        this.db = db;
        this.maxRetries = maxRetries;
    }

    /**
     * Executes a transaction and automatically retries it in case of a transient failure.
     * @param transactionalWork - The actual work that will be executed in the transaction.
     * @returns A promise that resolves with the value returned by the transactional work.
     */
    public async execute<T>(
        transactionalWork: (trx: Knex.Transaction) => Promise<T>,
    ): Promise<T> {
        let lastError: any = null;

        for (let attempt = 0; attempt < this.maxRetries; attempt++) {
            try {
                const result = await this.db.transaction(async (trx) => {
                    return transactionalWork(trx);
                });

                return result; // Transaction succeeded
            } catch (error) {
                lastError = error;
                if (!this.isTransientError(error)) {
                    break; // Non-transient error, do not retry
                }
                console.warn(
                    `Transaction failed with error: ${
                        error.message
                    }. Retrying ${attempt + 1}/${this.maxRetries}...`,
                );
            }
        }

        throw lastError; // All retries failed
    }

    /**
     * Determines if the error is transient (i.e., likely to succeed if retried).
     * Logs a human-readable error message and returns true if the error is considered transient; false otherwise.
     * @param error - The error that occurred.
     * @returns True if the error is considered transient; false otherwise.
     */
    private isTransientError(error: any): boolean {
        const transientErrors: { [key: string]: string } = {
            '40001': 'serialization_failure',
            '40P01': 'deadlock_detected',
            '55P03': 'lock_not_available',
        };

        const errorMessage = transientErrors[error.code];
        if (errorMessage) {
            console.warn(
                `Transient Error: ${errorMessage} (${error.code}). Error message: ${error.message}`,
            );
            return true;
        }

        console.error(`Non-transient Error: ${error.message} (${error.code})`);
        return false;
    }
}
