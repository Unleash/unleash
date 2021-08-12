import { Store } from './store';

export interface IAddonDto {
    provider: string;
    description: string;
    enabled: boolean;
    parameters: object;
    events: string[];
}

export interface IAddon extends IAddonDto {
    id: number;
    createdAt: Date;
}

export interface IAddonStore extends Store<IAddon, number> {
    insert(addon: IAddonDto): Promise<IAddon>;
    update(id: number, addon: IAddonDto): Promise<IAddon>;
}
