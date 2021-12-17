import { ICustomRole } from '../model';
import { Store } from './store';

export interface ICustomRoleInsert {
    name: string;
    description: string;
    roleType: string;
}

export interface ICustomRoleUpdate {
    id: number;
    name: string;
    description: string;
    roleType: string;
}

export interface IRoleStore extends Store<ICustomRole, number> {
    getAll(): Promise<ICustomRole[]>;
    create(role: ICustomRoleInsert): Promise<ICustomRole>;
    update(role: ICustomRoleUpdate): Promise<ICustomRole>;
    delete(id: number): Promise<void>;
}
