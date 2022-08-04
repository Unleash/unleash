import { ClientFeaturesResponse, FeatureInterface } from '../feature';
import { BootstrapProvider } from './bootstrap-provider';
import { StorageProvider } from './storage-provider';
import { Segment } from '../strategy/strategy';

export interface RepositoryInterface {
    getToggle(name: string): FeatureInterface;
    getToggles(): FeatureInterface[];
    getSegment(id: number): Segment | undefined;
    stop(): void;
    start(): Promise<void>;
}
export interface RepositoryOptions {
    appName: string;
    bootstrapProvider: BootstrapProvider;
    storageProvider: StorageProvider<ClientFeaturesResponse>;
}

interface FeatureToggleData {
    [key: string]: FeatureInterface;
}

export default class Repository {
    private timer: NodeJS.Timer | undefined;

    private appName: string;

    private bootstrapProvider: BootstrapProvider;

    private storageProvider: StorageProvider<ClientFeaturesResponse>;

    private data: FeatureToggleData = {};

    private segments: Map<number, Segment>;

    constructor({
        appName,
        bootstrapProvider,
        storageProvider,
    }: RepositoryOptions) {
        this.appName = appName;
        this.bootstrapProvider = bootstrapProvider;
        this.storageProvider = storageProvider;
        this.segments = new Map();
    }

    start(): Promise<void> {
        return this.loadBootstrap();
    }

    createSegmentLookup(segments: Segment[] | undefined): Map<number, Segment> {
        if (!segments) {
            return new Map();
        }
        return new Map(segments.map((segment) => [segment.id, segment]));
    }

    async save(response: ClientFeaturesResponse): Promise<void> {
        this.data = this.convertToMap(response.features);
        this.segments = this.createSegmentLookup(response.segments);

        await this.storageProvider.set(this.appName, response);
    }

    notEmpty(content: ClientFeaturesResponse): boolean {
        return content.features.length > 0;
    }

    async loadBootstrap(): Promise<void> {
        try {
            const content = await this.bootstrapProvider.readBootstrap();

            if (content && this.notEmpty(content)) {
                await this.save(content);
            }
        } catch (err: any) {
            // intentionally left empty
        }
    }

    private convertToMap(features: FeatureInterface[]): FeatureToggleData {
        const obj = features.reduce(
            (
                o: { [s: string]: FeatureInterface },
                feature: FeatureInterface,
            ) => {
                const a = { ...o };
                a[feature.name] = feature;
                return a;
            },
            {} as { [s: string]: FeatureInterface },
        );

        return obj;
    }

    stop(): void {
        if (this.timer) {
            clearTimeout(this.timer);
        }
    }

    getSegment(segmentId: number): Segment | undefined {
        return this.segments.get(segmentId);
    }

    getToggle(name: string): FeatureInterface {
        return this.data[name];
    }

    getToggles(): FeatureInterface[] {
        return Object.keys(this.data).map((key) => this.data[key]);
    }
}
