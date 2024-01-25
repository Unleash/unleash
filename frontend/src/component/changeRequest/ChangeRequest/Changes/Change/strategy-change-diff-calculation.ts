import {
    ChangeRequestEditStrategy,
    IChangeRequestUpdateStrategy,
} from 'component/changeRequest/changeRequest.types';
import { IFeatureStrategy } from 'interfaces/strategy';
import isEqual from 'lodash.isequal';
import omit from 'lodash.omit';

type JsonDiffProps = {
    snapshotValue: unknown;
    currentValue: unknown;
    changeValue: unknown;
    fallback?: unknown;
};
const hasJsonDiff = ({
    snapshotValue,
    currentValue,
    changeValue,
    fallback,
}: JsonDiffProps) => {
    const currentJson = JSON.stringify(currentValue ?? fallback);
    return (
        JSON.stringify(snapshotValue ?? fallback) !== currentJson &&
        JSON.stringify(changeValue ?? fallback) !== currentJson
    );
};

const hasChanged = (
    snapshotValue: unknown,
    currentValue: unknown,
    changeValue: unknown,
) => {
    if (typeof snapshotValue === 'object') {
        return (
            !isEqual(snapshotValue, currentValue) &&
            !isEqual(currentValue, changeValue)
        );
    }
    return hasJsonDiff({ snapshotValue, currentValue, changeValue });
};

type DataToOverwrite<Prop extends keyof ChangeRequestEditStrategy> = {
    property: Prop;
    oldValue: ChangeRequestEditStrategy[Prop];
    newValue: ChangeRequestEditStrategy[Prop];
};
type ChangesThatWouldBeOverwritten = DataToOverwrite<
    keyof ChangeRequestEditStrategy
>[];

export const getChangesThatWouldBeOverwritten = (
    currentStrategyConfig: IFeatureStrategy | undefined,
    change: IChangeRequestUpdateStrategy,
): ChangesThatWouldBeOverwritten | null => {
    const { snapshot } = change.payload;

    if (snapshot && currentStrategyConfig) {
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

                const hasJsonDiffWithFallback = (fallback: unknown) =>
                    hasJsonDiff({
                        snapshotValue,
                        currentValue,
                        changeValue,
                        fallback,
                    });

                // compare, assuming that order never changes
                if (key === 'segments') {
                    // segments can be undefined on the original
                    // object, but that doesn't mean it has changed
                    if (hasJsonDiffWithFallback([])) {
                        return {
                            property: key as keyof ChangeRequestEditStrategy,
                            oldValue: currentValue,
                            newValue: changeValue,
                        };
                    }
                } else if (key === 'variants') {
                    // strategy variants might not be defined, so use
                    // fallback values
                    if (hasJsonDiffWithFallback([])) {
                        return {
                            property: key as keyof ChangeRequestEditStrategy,
                            oldValue: currentValue,
                            newValue: changeValue,
                        };
                    }
                } else if (key === 'title') {
                    // the title can be defined as `null` or
                    // `undefined`, so we fallback to an empty string
                    if (hasJsonDiffWithFallback('')) {
                        return {
                            property: key as keyof ChangeRequestEditStrategy,
                            oldValue: currentValue,
                            newValue: changeValue,
                        };
                    }
                } else if (
                    hasChanged(snapshotValue, currentValue, changeValue)
                ) {
                    return {
                        property: key as keyof ChangeRequestEditStrategy,
                        oldValue: currentValue,
                        newValue: changeValue,
                    };
                }
            })
            .filter(
                (
                    change,
                ): change is DataToOverwrite<keyof ChangeRequestEditStrategy> =>
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
