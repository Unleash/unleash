import type { FeatureInterface, Segment } from '../feature.js';

export interface RepositoryInterface {
    getToggle(name: string): FeatureInterface | undefined;
    getToggles(): FeatureInterface[];
    getSegment(id: number): Segment | undefined;
}

export type RepositoryData = {
    features: FeatureInterface[];
    segments?: Segment[];
};

/**
 * In-memory, bootstrap-only repository. The SDK's repository fetches from
 * a server; the playground already has the features it wants to evaluate.
 */
export default class Repository implements RepositoryInterface {
    private readonly features: Map<string, FeatureInterface>;

    private readonly segments: Map<number, Segment>;

    constructor({ features, segments = [] }: RepositoryData) {
        this.features = new Map(
            features.map((feature) => [feature.name, feature]),
        );
        this.segments = new Map(
            segments.map((segment) => [segment.id, segment]),
        );
    }

    getSegment(segmentId: number): Segment | undefined {
        return this.segments.get(segmentId);
    }

    getToggle(name: string): FeatureInterface | undefined {
        return this.features.get(name);
    }

    getToggles(): FeatureInterface[] {
        return [...this.features.values()];
    }
}
