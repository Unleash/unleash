import type {
    IEventStore,
    IFeatureToggleClient,
    IFeatureToggleClientStore,
    IFeatureToggleQuery,
} from '../../../types';
import type { FeatureConfigurationClient } from '../../feature-toggle/types/feature-toggle-strategies-store-type';
import type ConfigurationRevisionService from '../../feature-toggle/configuration-revision-service';
import { UPDATE_REVISION } from '../../feature-toggle/configuration-revision-service';

type DeletedFeature = {
    name: string;
    project: string;
};

export type ClientFeatureChange = {
    updated: IFeatureToggleClient[];
    removed: DeletedFeature[];
    revisionId: number;
};

type Revision = {
    revisionId: number;
    updated: any[];
    removed: DeletedFeature[];
};

type RevisionCache = Record<string, Revision[]>;

const applyRevision = (first: Revision, last: Revision): Revision => {
    const updatedMap = new Map(
        [...first.updated, ...last.updated].map((feature) => [
            feature.name,
            feature,
        ]),
    );
    const removedMap = new Map(
        [...first.removed, ...last.removed].map((feature) => [
            feature.name,
            feature,
        ]),
    );

    for (const feature of last.removed) {
        updatedMap.delete(feature.name);
    }

    for (const feature of last.updated) {
        removedMap.delete(feature.name);
    }

    return {
        revisionId: last.revisionId,
        updated: Array.from(updatedMap.values()),
        removed: Array.from(removedMap.values()),
    };
};

const filterRevisionByProject = (
    revision: Revision,
    projects: string[],
): Revision => {
    const updated = revision.updated.filter(
        (feature) =>
            projects.includes('*') || projects.includes(feature.project),
    );
    const removed = revision.removed.filter(
        (feature) =>
            projects.includes('*') || projects.includes(feature.project),
    );
    return { ...revision, updated, removed };
};

export const calculateRequiredClientRevision = (
    revisions: Revision[],
    requiredRevisionId: number,
    projects: string[],
) => {
    const targetedRevisions = revisions.filter(
        (revision) => revision.revisionId > requiredRevisionId,
    );
    console.log('targeted revisions', targetedRevisions);
    const projectFeatureRevisions = targetedRevisions.map((revision) =>
        filterRevisionByProject(revision, projects),
    );

    return projectFeatureRevisions.reduce(applyRevision);
};

export class ClientFeatureToggleCache {
    private clientFeatureToggleStore: IFeatureToggleClientStore;

    private cache: RevisionCache = {};

    private eventStore: IEventStore;

    private currentRevisionId: number = 0;

    private interval: NodeJS.Timer;

    private configurationRevisionService: ConfigurationRevisionService;

    constructor(
        clientFeatureToggleStore: IFeatureToggleClientStore,
        eventStore: IEventStore,
        configurationRevisionService: ConfigurationRevisionService,
    ) {
        this.eventStore = eventStore;
        this.configurationRevisionService = configurationRevisionService;
        this.clientFeatureToggleStore = clientFeatureToggleStore;
        this.onUpdateRevisionEvent = this.onUpdateRevisionEvent.bind(this);

        this.initCache();
        this.configurationRevisionService.on(
            UPDATE_REVISION,
            this.onUpdateRevisionEvent,
        );
    }

    async getDelta(
        sdkRevisionId: number | undefined,
        environment: string,
        projects: string[],
    ): Promise<ClientFeatureChange> {
        const requiredRevisionId = sdkRevisionId || 0;
        const environmentRevisions = this.cache[environment];

        const compressedRevision = calculateRequiredClientRevision(
            environmentRevisions,
            requiredRevisionId,
            projects,
        );

        return Promise.resolve(compressedRevision);
    }

    private async onUpdateRevisionEvent() {
        await this.pollEvents();
    }

    public async pollEvents() {
        console.log("I'm polling!");
        // use scheduler service

        // Pull all events from the current revisionId
        // Find a list of every flag that changed in each environment and associate that with
        // the revisionId

        const latestRevision =
            await this.configurationRevisionService.getMaxRevisionId();

        const changeEvents = await this.eventStore.getRevisionRange(
            this.currentRevisionId,
            latestRevision,
        );

        for (const event of changeEvents) {
            console.log('Got a change event');
            console.log(event);
            event.featureName;
        }
        const changedToggles = [
            ...new Set(
                changeEvents
                    .filter((event) => event.featureName)
                    .map((event) => event.featureName!),
            ),
        ];
        const newToggles = await this.getChangedToggles(
            changedToggles,
            latestRevision, // TODO: this should come back from the same query to not be out of sync
        );

        console.log('I got the following toggles');
        console.log(JSON.stringify(newToggles));

        // if (!this.cache.development) {
        //     this.cache.development = [];
        // }
        // this.cache.development.push(newToggles);

        if (this.cache.development) {
            this.cache.development.push(newToggles);

            this.currentRevisionId = latestRevision;
        } else {
            console.log('WHY I AM HERE');
        }
    }

    async getChangedToggles(
        toggles: string[],
        revisionId: number,
    ): Promise<ClientFeatureChange> {
        const foundToggles = await this.getClientFeatures({
            toggleNames: toggles,
            environment: 'development ',
        });

        const toggleMap = new Map(
            foundToggles.map((toggle) => [toggle.name, toggle]),
        );

        //if the toggle is not in found toggles, then it must have been deleted
        const removed = toggles
            .filter((name) => toggleMap.has(name))
            .map((name) => ({ name, project: toggleMap.get(name)!.project }));

        return {
            updated: foundToggles as any, //impressionData is not on the type but should be
            removed,
            revisionId,
        };
    }

    public async initCache() {
        //TODO: This only returns stuff for the default environment!!! Need to pass a query to get the relevant environment
        // featuresByEnvironment cache

        // The base cache is a record of <environment, array>
        // Each array holds a collection of objects that contains the revisionId and which
        // flags changed in each revision. It also holds a type that informs us whether or not
        // the revision is the base case or if is an update or remove operation

        // To get the base for each cache we need to get all features for all environments and the max revision id

        // hardcoded for now
        // const environments = ["default", "development", "production"];
        const defaultCache = await this.getClientFeatures({
            environment: 'default ',
        });
        const developmentCache = await this.getClientFeatures({
            environment: 'development ',
        });
        const productionCache = await this.getClientFeatures({
            environment: 'production ',
        });
        // Always assume that the first item of the array is the base
        const cache = {
            default: [
                {
                    revisionId: this.currentRevisionId,
                    updated: [defaultCache],
                    removed: [],
                },
            ],
            development: [
                {
                    revisionId: this.currentRevisionId,
                    updated: [developmentCache],
                    removed: [],
                },
            ],
            production: [
                {
                    revisionId: this.currentRevisionId,
                    updated: [productionCache],
                    removed: [],
                },
            ],
        };

        this.cache = cache;

        // This is what the cache looks like
        // const cache = {
        // 	Default: [
        // 		{
        // 			type: "update",
        // 			revisionId: 4,
        // 			updated: [
        // 				{
        // 					name: "counter",
        // 					type: "release",
        //                     ...
        // 				},
        // 			],
        //          removed: []
        // 		},
        //         {
        //             type: "update",
        //             revisionId: 5,
        //             updated: [
        //                 {
        //                     name: "counter",
        //                     type: "release"
        //                     ...
        //                 }
        //             ]
        //         }
        // 	],
        // };

        // const baseCache = await this.getClientFeatures();
    }

    async getClientFeatures(
        query?: IFeatureToggleQuery,
    ): Promise<FeatureConfigurationClient[]> {
        const result = await this.clientFeatureToggleStore.getClient(
            query || {},
        );

        return result.map(
            ({
                name,
                type,
                enabled,
                project,
                stale,
                strategies,
                variants,
                description,
                impressionData,
                dependencies,
            }) => ({
                name,
                type,
                enabled,
                project,
                stale,
                strategies,
                variants,
                description,
                impressionData,
                dependencies,
            }),
        );
    }
}
