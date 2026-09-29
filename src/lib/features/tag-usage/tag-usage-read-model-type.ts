import type { ITagType } from '../tag-type/tag-type-store-type.js';

export interface ITagTypeWithUsage extends ITagType {
    valueCount: number;
    usedInProjects: number;
}

export interface ITagUsageReadModel {
    getTagTypesWithUsage(projects?: string[]): Promise<ITagTypeWithUsage[]>;
}
