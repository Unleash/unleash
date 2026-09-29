import type {
    ITagTypeWithUsage,
    ITagUsageReadModel,
} from './tag-usage-read-model-type.js';

export class FakeTagUsageReadModel implements ITagUsageReadModel {
    async getTagTypesWithUsage(
        _projects?: string[],
    ): Promise<ITagTypeWithUsage[]> {
        return [];
    }
}
