import { Knex } from 'knex';
import { IUnleashStores } from '../types/stores';
import { IUnleashConfig } from '../types/option';
import { Logger } from '../logger';

class HealthService {
    private db: Knex;

    private logger: Logger;

    constructor(
        { db }: Pick<IUnleashStores, 'db'>,
        { getLogger }: Pick<IUnleashConfig, 'getLogger'>,
    ) {
        this.db = db;
        this.logger = getLogger('services/health-service.ts');
    }

    async dbIsUp(): Promise<boolean> {
        const row = await this.db.raw('select 1');
        return !!row;
    }
}

export default HealthService;
module.exports = HealthService;
