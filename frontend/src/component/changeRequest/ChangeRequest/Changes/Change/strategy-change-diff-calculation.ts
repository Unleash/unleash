import {
    ChangeRequestEditStrategy,
    IChangeRequestUpdateSegment,
    IChangeRequestUpdateStrategy,
} from 'component/changeRequest/changeRequest.types';
import { ISegment } from 'interfaces/segment';
import { IFeatureStrategy } from 'interfaces/strategy';
import isEqual from 'lodash.isequal';
import omit from 'lodash.omit';

const stringifyWithFallback = (value: unknown, fallback: unknown) =>
    JSON.stringify(value ?? fallback);

const hasJsonDiff =
    (fallback?: unknown) =>
    (snapshotValue: unknown, currentValue: unknown, changeValue: unknown) => {
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
    return hasJsonDiff()(snapshotValue, currentValue, changeValue);
};

type StrategyDataToOverwrite<Prop extends keyof ChangeRequestEditStrategy> = {
    property: Prop;
    oldValue: ChangeRequestEditStrategy[Prop];
    newValue: ChangeRequestEditStrategy[Prop];
};

type SegmentDataToOverwrite<Prop extends keyof IChangeRequestUpdateSegment> = {
    property: Prop;
    oldValue: IChangeRequestUpdateSegment[Prop];
    newValue: IChangeRequestUpdateSegment[Prop];
};

type DataToOverwrite = {
    property: string;
    oldValue: unknown;
    newValue: unknown;
};

export type StrategyChangesThatWouldBeOverwritten = StrategyDataToOverwrite<
    keyof ChangeRequestEditStrategy
>[];

export type SegmentChangesThatWouldBeOverwritten = SegmentDataToOverwrite<
    keyof Omit<IChangeRequestUpdateSegment, 'snapshot'>
>[];

export type ChangesThatWouldBeOverwritten = DataToOverwrite[];

const getChangedProperty = (
    key: keyof ChangeRequestEditStrategy,
    currentValue: unknown,
    snapshotValue: unknown,
    changeValue: unknown,
) => {
    const fallbacks = { segments: [], variants: [], title: '' };
    const fallback = fallbacks[key as keyof typeof fallbacks] ?? undefined;
    const diffCheck = key in fallbacks ? hasJsonDiff(fallback) : hasChanged;

    const changeInfo = {
        property: key as keyof ChangeRequestEditStrategy,
        oldValue: currentValue,
        newValue: changeValue,
    };

    return diffCheck(snapshotValue, currentValue, changeValue)
        ? changeInfo
        : undefined;
};

type SegmentIndex = keyof Omit<
    IChangeRequestUpdateSegment['payload'],
    'snapshot'
>;

function isNotUndefined<T>(value: T | undefined): value is T {
    return value !== undefined;
}

const getSegmentChangedProperty = (
    key: SegmentIndex,
    currentValue: unknown,
    snapshotValue: unknown,
    changeValue: unknown,
) => {
    const fallbacks = { segments: [], variants: [], title: '' };
    const fallback = fallbacks[key as keyof typeof fallbacks] ?? undefined;
    const diffCheck = key in fallbacks ? hasJsonDiff(fallback) : hasChanged;

    const changeInfo = {
        property: key as SegmentIndex,
        oldValue: currentValue,
        newValue: changeValue,
    };

    return diffCheck(snapshotValue, currentValue, changeValue)
        ? changeInfo
        : undefined;
};

export function getSegmentChangesThatWouldBeOverwritten(
    currentSegmentConfig: ISegment | undefined,
    change: IChangeRequestUpdateSegment,
): ChangesThatWouldBeOverwritten | null {
    const { snapshot } = change.payload;
    if (!snapshot || !currentSegmentConfig) return null;

    const changes: ChangesThatWouldBeOverwritten = Object.entries(
        currentSegmentConfig,
    )
        .map(([key, currentValue]: [string, unknown]) => {
            const snapshotValue = snapshot[key as keyof ISegment];
            const changeValue = change.payload[key as SegmentIndex];

            return getSegmentChangedProperty(
                key as SegmentIndex,
                currentValue,
                snapshotValue,
                changeValue,
            );
        })
        .filter(isNotUndefined);

    if (changes.length) {
        changes.sort((a, b) => a.property.localeCompare(b.property));
        return changes;
    }

    return null;
}

export function getChangesThatWouldBeOverwritten(
    currentStrategyConfig: IFeatureStrategy | undefined,
    change: IChangeRequestUpdateStrategy,
): ChangesThatWouldBeOverwritten | null {
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
        .filter(isNotUndefined);

    if (changes.length) {
        changes.sort((a, b) => a.property.localeCompare(b.property));
        return changes;
    }

    return null;
}
