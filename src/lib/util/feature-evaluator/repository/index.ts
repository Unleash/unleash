import { EventEmitter } from 'events';
import { ClientFeaturesResponse, FeatureInterface } from '../feature';
import { CustomHeaders, CustomHeadersFunction } from '../headers';
import getUrl from '../url-utils';
import { HttpOptions } from '../http-options';
import { TagFilter } from '../tags';
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
    url: string;
    appName: string;
    instanceId: string;
    projectName?: string;
    refreshInterval: number;
    timeout?: number;
    headers?: CustomHeaders;
    customHeadersFunction?: CustomHeadersFunction;
    httpOptions?: HttpOptions;
    namePrefix?: string;
    tags?: Array<TagFilter>;
    bootstrapProvider: BootstrapProvider;
    bootstrapOverride?: boolean;
    storageProvider: StorageProvider<ClientFeaturesResponse>;
}

interface FeatureToggleData {
    [key: string]: FeatureInterface;
}

export default class Repository extends EventEmitter implements EventEmitter {
    private timer: NodeJS.Timer | undefined;

    private url: string;

    private etag: string | undefined;

    private appName: string;

    private instanceId: string;

    private refreshInterval: number;

    private headers?: CustomHeaders;

    private customHeadersFunction?: CustomHeadersFunction;

    private timeout?: number;

    private stopped = false;

    private projectName?: string;

    private httpOptions?: HttpOptions;

    private readonly namePrefix?: string;

    private readonly tags?: Array<TagFilter>;

    private bootstrapProvider: BootstrapProvider;

    private bootstrapOverride: boolean;

    private storageProvider: StorageProvider<ClientFeaturesResponse>;

    private ready: boolean = false;

    private connected: boolean = false;

    private data: FeatureToggleData = {};

    private segments: Map<number, Segment>;

    constructor({
        url,
        appName,
        instanceId,
        projectName,
        refreshInterval = 15_000,
        timeout,
        headers,
        customHeadersFunction,
        httpOptions,
        namePrefix,
        tags,
        bootstrapProvider,
        bootstrapOverride = true,
        storageProvider,
    }: RepositoryOptions) {
        super();
        this.url = url;
        this.refreshInterval = refreshInterval;
        this.instanceId = instanceId;
        this.appName = appName;
        this.projectName = projectName;
        this.headers = headers;
        this.timeout = timeout;
        this.customHeadersFunction = customHeadersFunction;
        this.httpOptions = httpOptions;
        this.namePrefix = namePrefix;
        this.tags = tags;
        this.bootstrapProvider = bootstrapProvider;
        this.bootstrapOverride = bootstrapOverride;
        this.storageProvider = storageProvider;
        this.segments = new Map();
    }

    validateFeature(feature: FeatureInterface) {
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

    async start(): Promise<void> {
        await Promise.all([this.loadBackup(), this.loadBootstrap()]);
    }

    async loadBackup(): Promise<void> {
        try {
            const content = await this.storageProvider.get(this.appName);

            if (this.ready) {
                return;
            }

            if (content && this.notEmpty(content)) {
                this.data = this.convertToMap(content.features);
                this.segments = this.createSegmentLookup(content.segments);
                this.setReady();
            }
        } catch (err) {
            this.emit(UnleashEvents.Error, err);
        }
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

    async save(
        response: ClientFeaturesResponse,
        fromApi: boolean,
    ): Promise<void> {
        if (fromApi) {
            this.connected = true;
            this.data = this.convertToMap(response.features);
            this.segments = this.createSegmentLookup(response.segments);
        } else if (!this.connected) {
            // Only allow bootstrap if not connected
            this.data = this.convertToMap(response.features);
            this.segments = this.createSegmentLookup(response.segments);
        }

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

            if (!this.bootstrapOverride && this.ready) {
                // early exit if we already have backup data and should not override it.
                return;
            }

            if (content && this.notEmpty(content)) {
                await this.save(content, false);
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

    mergeTagsToStringArray(tags: Array<TagFilter>): Array<string> {
        return tags.map((tag) => `${tag.name}:${tag.value}`);
    }

    stop() {
        this.stopped = true;
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
