import { Store } from './store';

export interface ITagType {
    name: string;
    description?: string;
    icon?: string;
}

export interface ITagTypeStore extends Store<ITagType, string> {
    createTagType(newTagType: ITagType): Promise<void>;
    bulkImport(tagTypes: ITagType[]): Promise<ITagType[]>;
    updateTagType(tagType: ITagType): Promise<void>;
}
