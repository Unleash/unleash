import { Store } from './store';

export interface ISettingInsert {
    name: string;
    content: any;
}

export interface ISettingStore extends Store<any, string> {
    insert(name: string, content: any): Promise<void>;
    updateRow(name: string, content: any): Promise<void>;
}
