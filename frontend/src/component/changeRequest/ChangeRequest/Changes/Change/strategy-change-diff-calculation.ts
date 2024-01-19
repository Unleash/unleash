import { IChangeRequestUpdateStrategy } from 'component/changeRequest/changeRequest.types';
import { IFeatureStrategy } from 'interfaces/strategy';
import isEqual from 'lodash.isequal';

const hasDiff = (object: unknown, objectToCompare: unknown) =>
    JSON.stringify(object) !== JSON.stringify(objectToCompare);

type DataToOverwrite<Prop extends keyof IFeatureStrategy> = {
    property: Prop;
    oldValue: IFeatureStrategy[Prop];
    newValue: IFeatureStrategy[Prop];
};
type ChangesThatWouldBeOverwritten = DataToOverwrite<keyof IFeatureStrategy>[];

export const getChangesThatWouldBeOverwritten = ({
    currentStrategyConfig,
    change,
}: {
    currentStrategyConfig?: IFeatureStrategy;
    change: IChangeRequestUpdateStrategy;
}): ChangesThatWouldBeOverwritten | null => {
    if (change.payload.snapshot && currentStrategyConfig) {
        const hasChanged = (a: unknown, b: unknown) => {
            if (typeof a === 'object') {
                return !isEqual(a, b);
            }
            return hasDiff(a, b);
        };

        // compare each property in the snapshot. The property order
        // might differ, so using JSON.stringify to compare them
        // doesn't work.
        const changes: ChangesThatWouldBeOverwritten = Object.entries(
            change.payload.snapshot,
        )
            .map(([key, snapshotValue]: [string, unknown]) => {
                const existingValue =
                    currentStrategyConfig[key as keyof IFeatureStrategy];

                // compare, assuming that order never changes
                if (key === 'segments') {
                    // segments can be undefined on the original
                    // object, but that doesn't mean it has changed
                    if (hasDiff(existingValue ?? [], snapshotValue)) {
                        return {
                            property: key as keyof IFeatureStrategy,
                            oldValue: existingValue,
                            newValue: snapshotValue,
                        };
                    }
                } else if (key === 'variants') {
                    // strategy variants might not be defined, so use
                    // fallback values
                    if (hasDiff(existingValue ?? [], snapshotValue ?? [])) {
                        return {
                            property: key as keyof IFeatureStrategy,
                            oldValue: existingValue,
                            newValue: snapshotValue,
                        };
                    }
                } else if (hasChanged(existingValue, snapshotValue)) {
                    return {
                        property: key as keyof IFeatureStrategy,
                        oldValue: existingValue,
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

        // todo: ensure that there aren't any missing properties that
        // don't exist in the snapshot that might be overwritten?
    }

    return null;
};
