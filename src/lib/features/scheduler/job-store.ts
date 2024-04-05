import { CRUDStore, type CrudStoreConfig } from '../../db/crud/crud-store';
import type { Db } from '../../server-impl';

export type JobSchema = {
    id: number;
    name: string;
    lastExecution: Date;
    checkpoint: string;
};

function stringToHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}

export class JobStore extends CRUDStore<JobSchema, Omit<JobSchema, 'id'>> {
    constructor(db: Db, config: CrudStoreConfig) {
        super('jobs', db, config);
    }

    public async acquireLock(jobName: string): Promise<boolean> {
        let lockAcquired = false;
        try {
            lockAcquired = await this.db
                .raw('SELECT pg_try_advisory_lock(?) as acquired', [
                    stringToHash(jobName),
                ])
                //.timeout(100)
                .then((res) => res.rows[0].acquired);
        } catch (e) {
            // ignored
            console.log(`Ignored error for ${jobName}`, e);
        }
        return lockAcquired;
    }

    public async releaseLock(jobName: string): Promise<void> {
        console.log(`Releasing lock for ${jobName}`);
        await this.db.raw('SELECT pg_advisory_unlock(?)', [
            stringToHash(jobName),
        ]);
        console.log(`DONE releasing lock for ${jobName}`);
    }

    public async getLastExecution(
        jobName: string,
    ): Promise<JobSchema | undefined> {
        return await this.db<JobSchema>('jobs')
            .select('*')
            .where({ name: jobName })
            .first();
    }
}
