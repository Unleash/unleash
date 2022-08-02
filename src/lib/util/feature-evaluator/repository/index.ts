import { EventEmitter } from 'events';
import { ClientFeaturesResponse, FeatureInterface } from '../feature';
import { BootstrapProvider } from './bootstrap-provider';
import { StorageProvider } from './storage-provider';
import { UnleashEvents } from '../events';
import { Segment } from '../strategy/strategy';

export interface RepositoryInterface extends EventEmitter {
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

export default class Repository extends EventEmitter implements EventEmitter {
    private timer: NodeJS.Timer | undefined;

    private appName: string;

    private bootstrapProvider: BootstrapProvider;

    private storageProvider: StorageProvider<ClientFeaturesResponse>;

    private ready: boolean = false;

    private data: FeatureToggleData = {};

    private segments: Map<number, Segment>;

    constructor({
        appName,
        bootstrapProvider,
        storageProvider,
    }: RepositoryOptions) {
        super();
        this.appName = appName;
        this.bootstrapProvider = bootstrapProvider;
        this.storageProvider = storageProvider;
        this.segments = new Map();
    }

    validateFeature(feature: FeatureInterface): void {
        const errors: string[] = [];
        if (!Array.isArray(feature.strategies)) {
            errors.push(
                `feature.strategies should be an array, but was ${typeof feature.strategies}`,
            );
        }

        if (feature.variants && !Array.isArray(feature.variants)) {
            errors.push(
                `feature.variants should be an array, but was ${typeof feature.variants}`,
            );
        }

        if (typeof feature.enabled !== 'boolean') {
            errors.push(
                `feature.enabled should be an boolean, but was ${typeof feature.enabled}`,
            );
        }

        if (errors.length > 0) {
            const err = new Error(errors.join(', '));
            this.emit(UnleashEvents.Error, err);
        }
    }

    start(): Promise<void> {
        return this.loadBootstrap();
    }

    setReady(): void {
        const doEmitReady = this.ready === false;
        this.ready = true;

        if (doEmitReady) {
            process.nextTick(() => {
                this.emit(UnleashEvents.Ready);
            });
        }
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

        this.setReady();
        this.emit(UnleashEvents.Changed, [...response.features]);
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
            this.emit(
                UnleashEvents.Warn,
                `Unleash SDK was unable to load bootstrap.
Message: ${err.message}`,
            );
        }
    }

    private convertToMap(features: FeatureInterface[]): FeatureToggleData {
        const obj = features.reduce(
            (
                o: { [s: string]: FeatureInterface },
                feature: FeatureInterface,
            ) => {
                const a = { ...o };
                this.validateFeature(feature);
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
        this.removeAllListeners();
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
