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

export type StrategyChangesThatWouldBeOverwritten = StrategyDataToOverwrite<
    keyof ChangeRequestEditStrategy
>[];

export type SegmentChangesThatWouldBeOverwritten = SegmentDataToOverwrite<
    keyof IChangeRequestUpdateSegment
>[];

const removeEmptyEntries = (
    change: unknown,
): change is StrategyDataToOverwrite<keyof ChangeRequestEditStrategy> =>
    Boolean(change);

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

export function getChangesThatWouldBeOverwritten(
    currentStrategyConfig: IFeatureStrategy | undefined,
    change: IChangeRequestUpdateStrategy,
): StrategyChangesThatWouldBeOverwritten | null;
export function getChangesThatWouldBeOverwritten(
    currentSegmentConfig: ISegment | undefined,
    change: IChangeRequestUpdateSegment,
): SegmentChangesThatWouldBeOverwritten | null;

export function getChangesThatWouldBeOverwritten<
    BaseType extends IFeatureStrategy | ISegment,
    ChangeType extends
        | IChangeRequestUpdateStrategy
        | IChangeRequestUpdateSegment,
>(
    currentStrategyConfig: BaseType | undefined,
    change: ChangeType,
):
    | StrategyChangesThatWouldBeOverwritten
    | SegmentChangesThatWouldBeOverwritten
    | null {
    const { snapshot } = change.payload;
    if (!snapshot || !currentStrategyConfig) return null;

    const changes: StrategyChangesThatWouldBeOverwritten = Object.entries(
        omit(currentStrategyConfig, 'strategyName'),
    )
        .map(([key, currentValue]: [string, unknown]) => {
            const snapshotValue = snapshot[key as keyof BaseType];
            const changeValue = change.payload[key as keyof ChangeType];

            return getChangedProperty(
                key as keyof ChangeType,
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
}
