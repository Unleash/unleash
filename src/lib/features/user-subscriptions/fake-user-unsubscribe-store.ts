import type { IUserUnsubscribeStore } from './user-unsubscribe-store-type';

export class FakeUserUnsubscribeStore implements IUserUnsubscribeStore {
    async insert() {}

    async delete(): Promise<void> {}

    destroy(): void {}
}
