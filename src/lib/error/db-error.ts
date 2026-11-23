const UNIQUE_CONSTRAINT_VIOLATION = '23505';
const FOREIGN_KEY_VIOLATION = '23503';
const CHARACTER_NOT_IN_REPERTOIRE = '22021';
const UNTRANSLATABLE_CHARACTER = '22P05';

const TRANSIENT_DB_ERROR_CODES = new Set([
    // PostgreSQL SQLSTATE codes
    '08001', // Client could not establish a connection
    '08003', // Connection does not exist
    '08006', // Connection failure
    '40001', // Serialization failure
    '40P01', // Deadlock detected
    '55P03', // Lock unavailable
    '57P01', // Administrative shutdown
    '57P02', // Shutdown due to a crash
    '57P03', // Server cannot accept connections now
    // Node.js system errors
    'ECONNRESET', // Connection reset by peer
    'ECONNREFUSED', // Connection refused
    'ETIMEDOUT', // Network operation timed out
    'EPIPE', // Write attempted on a closed pipe or socket
]);

export const isTransientDbError = (error: unknown): boolean =>
    error instanceof Error &&
    (error.name === 'KnexTimeoutError' ||
        ('code' in error &&
            typeof error.code === 'string' &&
            TRANSIENT_DB_ERROR_CODES.has(error.code)));

export {
    UNIQUE_CONSTRAINT_VIOLATION,
    FOREIGN_KEY_VIOLATION,
    CHARACTER_NOT_IN_REPERTOIRE,
    UNTRANSLATABLE_CHARACTER,
};
