import type { ISettingStore, IUnleashConfig } from '../types/index.js';
import semver, { lt, type SemVer } from 'semver';

const MIN_SUPPORTED_POSTGRES_VERSION: SemVer = semver.parse('14.0.0')!;

export async function compareAndLogPostgresVersion(
    config: IUnleashConfig,
    settingStore: ISettingStore,
): Promise<void> {
    const logger = config.getLogger('server-impl/postgresVersionWarner');
    const postgresVersion = await settingStore.postgresVersion();
    const pgSemVer = semver.coerce(postgresVersion); // Postgres usually reports Major.Minor, semver needs a patch version included in string
    if (pgSemVer !== null && lt(pgSemVer, MIN_SUPPORTED_POSTGRES_VERSION)) {
        logger.error(
            `You are running an unsupported version of PostgreSQL: ${postgresVersion}. You'll have to upgrade to Postgres 14 or newer to continue getting our support.`,
        );
    } else {
        logger.info(`Running PostgreSQL version ${postgresVersion}.`);
    }
}
