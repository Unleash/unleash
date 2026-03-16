import type { IDBOption } from '../types/index.js';

const cloneSslOptions = (ssl: IDBOption['ssl']): IDBOption['ssl'] => {
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
