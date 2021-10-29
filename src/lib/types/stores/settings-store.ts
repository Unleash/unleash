import { Store } from './store';

export interface ISettingInsert {
    name: string;
    content: any;
}

export interface ISettingStore extends Store<any, string> {
    insert<T>(name: string, content: T): Promise<void>;
    updateRow(name: string, content: any): Promise<void>;
}
