import {
    IAddon,
    IAddonDto,
    IAddonStore,
} from '../../lib/types/stores/addon-store';
import NotFoundError from '../../lib/error/notfound-error';

export default class FakeAddonStore implements IAddonStore {
    addons: IAddon[] = [];

    highestId = 0;

    async delete(key: number): Promise<void> {
        this.addons.splice(
            this.addons.findIndex((a) => a.id === key),
            1,
        );
    }

    async deleteAll(): Promise<void> {
        this.addons = [];
    }

    destroy(): void {}

    async exists(key: number): Promise<boolean> {
        return this.addons.some((a) => a.id === key);
    }

    async get(key: number): Promise<IAddon> {
        const addon = this.addons.find((a) => a.id === key);
        if (addon) {
            return addon;
        }
        throw new NotFoundError(`Could not find addon with id ${key}`);
    }

    async getAll(): Promise<IAddon[]> {
        return this.addons;
    }

    async insert(addon: IAddonDto): Promise<IAddon> {
        const ins: IAddon = {
            id: this.highestId++,
            createdAt: new Date(),
            ...addon,
        };
        this.addons.push(ins);
        return ins;
    }

    async update(id: number, addon: IAddonDto): Promise<IAddon> {
        await this.delete(id);
        const inserted: IAddon = { id, createdAt: new Date(), ...addon };
        this.addons.push(inserted);
        return inserted;
    }
}
