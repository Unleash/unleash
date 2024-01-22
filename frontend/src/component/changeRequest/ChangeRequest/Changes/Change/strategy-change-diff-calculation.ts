import {
    ChangeRequestEditStrategy,
    IChangeRequestUpdateStrategy,
} from 'component/changeRequest/changeRequest.types';
import { IFeatureStrategy } from 'interfaces/strategy';
import isEqual from 'lodash.isequal';
import omit from 'lodash.omit';

type JsonDiffProps = {
    snapshotValue: unknown;
    liveValue: unknown;
    changeValue: unknown;
    fallback?: unknown;
};
const hasJsonDiff = ({
    snapshotValue,
    liveValue,
    changeValue,
    fallback,
}: JsonDiffProps) => {
    const liveJson = JSON.stringify(liveValue ?? fallback);
    return (
        JSON.stringify(snapshotValue ?? fallback) !== liveJson &&
        JSON.stringify(changeValue ?? fallback) !== liveJson
    );
};

type DataToOverwrite<Prop extends keyof IFeatureStrategy> = {
    property: Prop;
    oldValue: IFeatureStrategy[Prop];
    newValue: IFeatureStrategy[Prop];
};
type ChangesThatWouldBeOverwritten = DataToOverwrite<keyof IFeatureStrategy>[];

export const getChangesThatWouldBeOverwritten = (
    currentStrategyConfig: IFeatureStrategy | undefined,
    change: IChangeRequestUpdateStrategy,
): ChangesThatWouldBeOverwritten | null => {
    const { snapshot } = change.payload;
    if (snapshot && currentStrategyConfig) {
        const hasChanged = (
            snapshotValue: unknown,
            liveValue: unknown,
            changeValue: unknown,
        ) => {
            if (typeof snapshotValue === 'object') {
                return (
                    !isEqual(snapshotValue, liveValue) &&
                    !isEqual(snapshotValue, changeValue)
                );
            }
            return hasJsonDiff({ snapshotValue, liveValue, changeValue });
        };

        // compare each property in the snapshot. The property order
        // might differ, so using JSON.stringify to compare them
        // doesn't work.
        const changes: ChangesThatWouldBeOverwritten = Object.entries(
            omit(currentStrategyConfig, 'strategyName'),
        )
            .map(([key, currentValue]: [string, unknown]) => {
                const snapshotValue = snapshot[key as keyof IFeatureStrategy];
                const changeValue =
                    change.payload[key as keyof ChangeRequestEditStrategy];

                const jsonDiff = (fallback: unknown = undefined) =>
                    hasJsonDiff({
                        snapshotValue,
                        liveValue: currentValue,
                        changeValue,
                        fallback,
                    });

                // compare, assuming that order never changes
                if (key === 'segments') {
                    // segments can be undefined on the original
                    // object, but that doesn't mean it has changed
                    if (jsonDiff([])) {
                        return {
                            property: key as keyof IFeatureStrategy,
                            oldValue: currentValue,
                            newValue: changeValue,
                        };
                    }
                } else if (key === 'variants') {
                    // strategy variants might not be defined, so use
                    // fallback values
                    if (jsonDiff([])) {
                        return {
                            property: key as keyof IFeatureStrategy,
                            oldValue: currentValue,
                            newValue: changeValue,
                        };
                    }
                } else if (key === 'title') {
                    // the title can be defined as `null` or
                    // `undefined`, so we fallback to an empty string
                    if (jsonDiff('')) {
                        return {
                            property: key as keyof IFeatureStrategy,
                            oldValue: currentValue,
                            newValue: changeValue,
                        };
                    }
                } else if (
                    hasChanged(snapshotValue, currentValue, changeValue)
                ) {
                    return {
                        property: key as keyof IFeatureStrategy,
                        oldValue: currentValue,
                        newValue: changeValue,
                    };
                }
            })
            .filter(
                (change): change is DataToOverwrite<keyof IFeatureStrategy> =>
                    Boolean(change),
            );

        if (changes.length) {
            // we have changes that would be overwritten
            changes.sort((a, b) => a.property.localeCompare(b.property));
            return changes;
        }
    }

    return null;
};
