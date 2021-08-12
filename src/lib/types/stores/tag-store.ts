import { ITag } from '../model';
import { Store } from './store';

export interface ITagStore extends Store<ITag, ITag> {
    getTagsByType(type: string): Promise<ITag[]>;
    getTag(type: string, value: string): Promise<ITag>;
    createTag(tag: ITag): Promise<void>;
    bulkImport(tags: ITag[]): Promise<ITag[]>;
}
