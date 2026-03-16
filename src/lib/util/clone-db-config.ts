import type { IDBOption, ISSLOption } from '../types/index.js';

const cloneSslOptions = (
    ssl: IDBOption['ssl'],
): ISSLOption | boolean | undefined => {
    if (ssl == null || typeof ssl === 'boolean') {
        return ssl;
    }

    return {
        ...ssl,
    };
};

export const cloneDbConfig = (dbConfig: IDBOption): IDBOption => ({
    ...dbConfig,
    ssl: cloneSslOptions(dbConfig.ssl),
    pool:
        dbConfig.pool != null
            ? {
                  ...dbConfig.pool,
              }
            : dbConfig.pool,
});
