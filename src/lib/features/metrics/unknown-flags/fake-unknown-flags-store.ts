import type {
    IUnknownFlagsStore,
    UnknownFlag,
    UnknownFlagReport,
    QueryParams,
} from './unknown-flags-store.js';

export class FakeUnknownFlagsStore implements IUnknownFlagsStore {
    private unknownFlagMap = new Map<string, UnknownFlagReport>();

    private getKey(flag: UnknownFlagReport): string {
        return `${flag.name}:${flag.appName}:${flag.environment}`;
    }

    async insert(flags: UnknownFlagReport[]): Promise<void> {
        this.unknownFlagMap.clear();
        for (const flag of flags) {
            this.unknownFlagMap.set(this.getKey(flag), flag);
        }
    }

    private groupFlags(flags: UnknownFlagReport[]): UnknownFlag[] {
        const byName = new Map<string, Map<string, Map<string, Date>>>();

        for (const f of flags) {
            const apps =
                byName.get(f.name) ?? new Map<string, Map<string, Date>>();
            const envs = apps.get(f.appName) ?? new Map<string, Date>();
            const prev = envs.get(f.environment);
            if (!prev || f.lastSeenAt > prev)
                envs.set(f.environment, f.lastSeenAt);
            apps.set(f.appName, envs);
            byName.set(f.name, apps);
        }

        const out: UnknownFlag[] = [];
        for (const [name, appsMap] of byName) {
            let lastSeenAt: Date | null = null;

            const reports = Array.from(appsMap.entries()).map(
                ([appName, envMap]) => {
                    const environments = Array.from(envMap.entries()).map(
                        ([environment, seenAt]) => {
                            if (!lastSeenAt || seenAt > lastSeenAt)
                                lastSeenAt = seenAt;
                            return { environment, seenAt };
                        },
                    );
                    return { appName, environments };
                },
            );

            out.push({
                name,
                lastSeenAt: lastSeenAt ?? new Date(0),
                reports,
            });
        }
        return out;
    }

    async getAll({ limit, orderBy }: QueryParams = {}): Promise<UnknownFlag[]> {
        const flat = Array.from(this.unknownFlagMap.values());
        const flags = this.groupFlags(flat);
        if (orderBy) {
            flags.sort((a, b) => {
                for (const { column, order } of orderBy) {
                    if (a[column] < b[column]) return order === 'asc' ? -1 : 1;
                    if (a[column] > b[column]) return order === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        if (!limit) return flags;
        return flags.slice(0, limit);
    }

    async clear(hoursAgo: number): Promise<void> {
        const cutoff = Date.now() - hoursAgo * 60 * 60 * 1000;
        for (const [key, flag] of this.unknownFlagMap.entries()) {
            if (flag.lastSeenAt.getTime() < cutoff) {
                this.unknownFlagMap.delete(key);
            }
        }
    }

    async deleteAll(): Promise<void> {
        this.unknownFlagMap.clear();
    }

    async count(): Promise<number> {
        return this.unknownFlagMap.size;
    }
}
