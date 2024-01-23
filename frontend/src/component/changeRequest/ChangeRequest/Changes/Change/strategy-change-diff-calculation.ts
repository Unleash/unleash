import { IChangeRequestUpdateStrategy } from 'component/changeRequest/changeRequest.types';
import { IFeatureStrategy } from 'interfaces/strategy';
import isEqual from 'lodash.isequal';

const hasJsonDiff = (object: unknown, objectToCompare: unknown) =>
    JSON.stringify(object) !== JSON.stringify(objectToCompare);

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
        const hasChanged = (a: unknown, b: unknown) => {
            if (typeof a === 'object') {
                return !isEqual(a, b);
            }
            return hasJsonDiff(a, b);
        };

        // compare each property in the snapshot. The property order
        // might differ, so using JSON.stringify to compare them
        // doesn't work.
        const changes: ChangesThatWouldBeOverwritten = Object.entries(
            currentStrategyConfig,
        )
            .map(([key, currentValue]: [string, unknown]) => {
                const snapshotValue = snapshot[key as keyof IFeatureStrategy];

                // compare, assuming that order never changes
                if (key === 'segments') {
                    // segments can be undefined on the original
                    // object, but that doesn't mean it has changed
                    if (hasJsonDiff(snapshotValue, currentValue ?? [])) {
                        return {
                            property: key as keyof IFeatureStrategy,
                            oldValue: currentValue,
                            newValue: snapshotValue,
                        };
                    }
                } else if (key === 'variants') {
                    // strategy variants might not be defined, so use
                    // fallback values
                    if (hasJsonDiff(snapshotValue ?? [], currentValue ?? [])) {
                        return {
                            property: key as keyof IFeatureStrategy,
                            oldValue: currentValue,
                            newValue: snapshotValue,
                        };
                    }
                } else if (key === 'title') {
                    // the title can be defined as `null` or
                    // `undefined`, so we fallback to an empty string
                    if (hasJsonDiff(snapshotValue ?? '', currentValue ?? '')) {
                        return {
                            property: key as keyof IFeatureStrategy,
                            oldValue: currentValue,
                            newValue: snapshotValue,
                        };
                    }
                } else if (hasChanged(snapshotValue, currentValue)) {
                    return {
                        property: key as keyof IFeatureStrategy,
                        oldValue: currentValue,
                        newValue: snapshotValue,
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
