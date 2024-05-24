import type { ISettingStore, IUnleashConfig } from '../types';
import semver, { lt, type SemVer } from 'semver';

const MIN_SUPPORTED_POSTGRES_VERSION: SemVer = semver.parse('13.0.0')!;

export async function compareAndLogPostgresVersion(
    config: IUnleashConfig,
    settingStore: ISettingStore,
): Promise<void> {
    const logger = config.getLogger('server-impl/postgresVersionWarner');
    const postgresVersion = await settingStore.postgresVersion();
    const pgSemVer = semver.coerce(postgresVersion); // Postgres usually reports Major.Minor, semver needs a patch version included in string
    if (pgSemVer !== null && lt(pgSemVer, MIN_SUPPORTED_POSTGRES_VERSION)) {
        logger.error(
            `You are using PostgreSQL version ${postgresVersion}. Unleash only supports Postgres 13 and newer. Unleash might work, but database errors will not be supported`,
        );
    } else {
        logger.info(`Running PostgreSQL version ${postgresVersion}.`);
    }
}
