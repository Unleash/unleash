import type { IUnknownFlagsStore, UnknownFlag } from './unknown-flags-store';

export class FakeUnknownFlagsStore implements IUnknownFlagsStore {
    private unknownFlagRecord: Record<string, UnknownFlag> = {};

    async replaceAll(flags: UnknownFlag[]): Promise<void> {
        this.unknownFlagRecord = {};
        for (const flag of flags) {
            this.unknownFlagRecord[flag.name] = flag;
        }
    }

    async getAll(): Promise<UnknownFlag[]> {
        return Object.values(this.unknownFlagRecord);
    }

    async clear(hoursAgo: number): Promise<void> {
        const now = new Date();
        for (const flag of Object.values(this.unknownFlagRecord)) {
            if (
                flag.seenAt.getTime() <
                now.getTime() - hoursAgo * 60 * 60 * 1000
            ) {
                delete this.unknownFlagRecord[flag.name];
            }
        }
    }

    async deleteAll(): Promise<void> {
        this.unknownFlagRecord = {};
    }
}
