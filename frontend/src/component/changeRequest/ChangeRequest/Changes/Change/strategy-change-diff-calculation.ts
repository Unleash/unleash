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

const stringifyWithFallback = (value: unknown, fallback: unknown) =>
    JSON.stringify(value ?? fallback);

const hasJsonDiff = ({
    snapshotValue,
    currentValue,
    changeValue,
    fallback,
}: JsonDiffProps) => {
    const currentJson = stringifyWithFallback(currentValue, fallback);
    return (
        stringifyWithFallback(snapshotValue, fallback) !== currentJson &&
        stringifyWithFallback(changeValue, fallback) !== currentJson
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

const removeEmptyEntries = (
    change: unknown,
): change is DataToOverwrite<keyof ChangeRequestEditStrategy> =>
    Boolean(change);

const getChangedProperty = (
    key: keyof ChangeRequestEditStrategy,
    currentValue: unknown,
    snapshotValue: unknown,
    changeValue: unknown,
) => {
    const fallbacks = { segments: [], variants: [], title: '' };
    const fallback = fallbacks[key as keyof typeof fallbacks] ?? undefined;

    const changeInfo = {
        property: key as keyof ChangeRequestEditStrategy,
        oldValue: currentValue,
        newValue: changeValue,
    };

    if (key in fallbacks) {
        return hasJsonDiff({
            snapshotValue,
            currentValue,
            changeValue,
            fallback,
        })
            ? changeInfo
            : undefined;
    } else if (hasChanged(snapshotValue, currentValue, changeValue)) {
        return changeInfo;
    }
};

export const getChangesThatWouldBeOverwritten = (
    currentStrategyConfig: IFeatureStrategy | undefined,
    change: IChangeRequestUpdateStrategy,
): ChangesThatWouldBeOverwritten | null => {
    const { snapshot } = change.payload;
    if (!snapshot || !currentStrategyConfig) return null;

    const changes: ChangesThatWouldBeOverwritten = Object.entries(
        omit(currentStrategyConfig, 'strategyName'),
    )
        .map(([key, currentValue]: [string, unknown]) => {
            const snapshotValue = snapshot[key as keyof IFeatureStrategy];
            const changeValue =
                change.payload[key as keyof ChangeRequestEditStrategy];

            return getChangedProperty(
                key as keyof ChangeRequestEditStrategy,
                currentValue,
                snapshotValue,
                changeValue,
            );
        })
        .filter(removeEmptyEntries);

    if (changes.length) {
        changes.sort((a, b) => a.property.localeCompare(b.property));
        return changes;
    }

    return null;
};
