import type {
    IPageQuery,
    ITagTypeWithUsage,
    ITagUsageReadModel,
    ITagValuesUsage,
} from './tag-usage-read-model-type.js';

export class FakeTagUsageReadModel implements ITagUsageReadModel {
    async getTagTypesWithUsage(
        _projects?: string[],
    ): Promise<ITagTypeWithUsage[]> {
        return [];
    }

    async getTagValueUsage(
        _type: string,
        _page: IPageQuery,
        _projects?: string[],
    ): Promise<ITagValuesUsage> {
        return { total: 0, tagValues: [] };
    }
}
