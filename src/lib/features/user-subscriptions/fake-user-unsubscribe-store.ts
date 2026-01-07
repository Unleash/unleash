import type { IUserUnsubscribeStore } from './user-unsubscribe-store-type.js';

export class FakeUserUnsubscribeStore implements IUserUnsubscribeStore {
    async insert() {}

    async delete(): Promise<void> {}

    destroy(): void {}
}
