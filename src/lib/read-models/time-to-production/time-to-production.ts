import { differenceInDays } from 'date-fns';
import { FeatureToggle, IEvent, IProjectEnvironment } from 'lib/types';
import { ICreateEnabledDates } from '../../types/stores/project-stats-store-type';

interface IFeatureTimeToProdCalculationMap {
    [index: string]: IFeatureTimeToProdData;
}

interface IFeatureTimeToProdData {
    createdAt: string;
    events: IEvent[];
}

export class TimeToProduction {
    private features: FeatureToggle[];

    private productionEnvironments: IProjectEnvironment[];

    private events: IEvent[];

    // todo: remove
    constructor(
        features: FeatureToggle[],
        productionEnvironments: IProjectEnvironment[],
        events: IEvent[],
    ) {
        this.features = features;
        this.productionEnvironments = productionEnvironments;
        this.events = events;
    }

    // todo: remove
    calculateAverageTimeToProd(): number {
        const featureEvents = this.getFeatureEvents();
        const sortedFeatureEvents =
            this.sortFeatureEventsByCreatedAt(featureEvents);

        const timeToProdPerFeature =
            this.calculateTimeToProdForFeatures(sortedFeatureEvents);
        if (timeToProdPerFeature.length) {
            const sum = timeToProdPerFeature.reduce(
                (acc, curr) => acc + curr,
                0,
            );

            return Number(
                (sum / Object.keys(sortedFeatureEvents).length).toFixed(1),
            );
        }

        return 0;
    }

    static calculateAverageTimeToProd(items: ICreateEnabledDates[]): number {
        const timeToProdPerFeature =
            TimeToProduction.calculateTimeToProdForFeatures(items);
        if (timeToProdPerFeature.length) {
            const sum = timeToProdPerFeature.reduce(
                (acc, curr) => acc + curr,
                0,
            );

            return Number((sum / Object.keys(items).length).toFixed(1));
        }

        return 0;
    }

    // todo: remove, as DB query can handle it
    getFeatureEvents(): IFeatureTimeToProdCalculationMap {
        return this.getProductionEvents(this.events).reduce((acc, event) => {
            if (acc[event.featureName]) {
                acc[event.featureName].events.push(event);
            } else {
                const foundFeature = this.features.find(
                    (feature) => feature.name === event.featureName,
                );
                acc[event.featureName] = { events: [event] };
                acc[event.featureName].createdAt = foundFeature?.createdAt;
            }

            return acc;
        }, {});
    }

    // todo: remove it as DB query can handle it
    private getProductionEvents(events: IEvent[]): IEvent[] {
        return events.filter((event) => {
            const found = this.productionEnvironments.find(
                (env) => env.name === event.environment,
            );

            if (found) {
                return found.type === 'production';
            }

            return false;
        });
    }

    private calculateTimeToProdForFeatures(
        featureEvents: IFeatureTimeToProdCalculationMap,
    ): number[] {
        return Object.keys(featureEvents).map((featureName) => {
            const feature = featureEvents[featureName];

            const earliestEvent = feature.events[0];

            const createdAtDate = new Date(feature.createdAt);
            const eventDate = new Date(earliestEvent.createdAt);
            const diff = differenceInDays(eventDate, createdAtDate);

            return diff;
        });
    }

    private static calculateTimeToProdForFeatures(
        items: ICreateEnabledDates[],
    ): number[] {
        return items.map((item) =>
            differenceInDays(item.enabled, item.created),
        );
    }

    // todo: remove as DB query can handle it
    sortFeatureEventsByCreatedAt(
        featureEvents: IFeatureTimeToProdCalculationMap,
    ): IFeatureTimeToProdCalculationMap {
        return Object.keys(featureEvents).reduce((acc, featureName) => {
            const feature = featureEvents[featureName];
            acc[featureName] = {
                ...feature,
                events: feature.events.sort((a, b) => {
                    const aDate = new Date(a.createdAt);
                    const bDate = new Date(b.createdAt);

                    if (aDate > bDate) {
                        return 1;
                    }
                    if (aDate < bDate) {
                        return -1;
                    }
                    return 0;
                }),
            };

            return acc;
        }, {});
    }
}
