import parseDbUrl from 'parse-database-url';

export const getDbConfig = (): object => {
    const url =
        process.env.TEST_DATABASE_URL ||
        'postgres://unleash_user:password@localhost:5432/unleash_test';
    return parseDbUrl(url);
};
