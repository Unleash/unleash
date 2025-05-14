import type { Store } from '../../types/stores/store.js';

export interface ITagType {
    name: string;
    description?: string;
    icon?: string | null;
    color?: string | null;
}

export interface ITagTypeStore extends Store<ITagType, string> {
    createTagType(newTagType: ITagType): Promise<void>;
    bulkImport(tagTypes: ITagType[]): Promise<ITagType[]>;
    updateTagType(tagType: ITagType): Promise<void>;
}
