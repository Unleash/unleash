import type { ITagType } from '../tag-type/tag-type-store-type.js';

export interface ITagTypeWithUsage extends ITagType {
    valueCount: number;
    usedInProjects: number;
}

export interface ITagValueUsage {
    value: string;
    usedInActiveFeatures: number;
    usedInArchivedFeatures: number;
}

export interface ITagValuesUsage {
    total: number;
    tagValues: ITagValueUsage[];
}

export interface IPageQuery {
    limit: number;
    offset: number;
}

export interface ITagUsageReadModel {
    getTagTypesWithUsage(projects?: string[]): Promise<ITagTypeWithUsage[]>;
    getTagValueUsage(
        type: string,
        page: IPageQuery,
        projects?: string[],
    ): Promise<ITagValuesUsage>;
}
