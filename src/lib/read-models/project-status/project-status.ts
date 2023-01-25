import { differenceInDays, isWithinInterval, subDays } from 'date-fns';
import { FeatureToggle, IEvent, IProjectEnvironment } from 'lib/types';

interface IFeatureTimeToProdCalculationMap {
    [index: string]: IFeatureTimeToProdData;
}

interface IFeatureTimeToProdData {
    createdAt: string;
    events: IEvent[];
}

export class ProjectStatus {
    private features: FeatureToggle[];

    private productionEnvironments: IProjectEnvironment[];

    private events: IEvent[];

    constructor(
        features: FeatureToggle[],
        productionEnvironments: IProjectEnvironment[],
        events: IEvent[],
    ) {
        this.features = features;
        this.productionEnvironments = productionEnvironments;
        this.events = events;
    }

    filterEventsByDate = (events: IEvent[], windowStart: Date): IEvent[] => {
        return events.filter((event) => {
            return isWithinInterval(new Date(event.createdAt), {
                start: subDays(windowStart, 30),
                end: windowStart,
            });
        });
    };

    calculateAverageTimeToProd(windowStart = new Date()): number {
        const featureEvents = this.getFeatureEvents(windowStart);
        const sortedFeatureEvents =
            this.sortFeatureEventsByCreatedAt(featureEvents);

        console.log(sortedFeatureEvents);

        const timeToProdPerFeature =
            this.calculateTimeToProdForFeatures(sortedFeatureEvents);
        if (timeToProdPerFeature.length) {
            const sum = timeToProdPerFeature.reduce(
                (acc, curr) => acc + curr,
                0,
            );

            return sum / Object.keys(sortedFeatureEvents).length;
        }

        return 0;
    }

    getFeatureEvents(window: Date): IFeatureTimeToProdCalculationMap {
        return this.filterEventsByDate(
            this.getProductionEvents(this.events),
            window,
        ).reduce((acc, event) => {
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

    getProductionEvents(events: IEvent[]): IEvent[] {
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

    calculateTimeToProdForFeatures(
        featureEvents: IFeatureTimeToProdCalculationMap,
    ): number[] {
        return Object.keys(featureEvents).map((featureName) => {
            const feature = featureEvents[featureName];

            const earliestEvent = feature.events[0];

            const createdAtDate = new Date(feature.createdAt);
            const eventDate = new Date(earliestEvent.createdAt);
            const diff = differenceInDays(eventDate, createdAtDate);
            console.log(earliestEvent, createdAtDate, diff);

            return diff;
        });
    }

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
