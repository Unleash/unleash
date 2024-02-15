import {
    IChangeRequestPatchVariant,
    IChangeRequestUpdateSegment,
    IChangeRequestUpdateStrategy,
} from 'component/changeRequest/changeRequest.types';
import { IFeatureVariant } from 'interfaces/featureToggle';
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

type DataToOverwrite = {
    property: string;
    oldValue: unknown;
    newValue: unknown;
};

export type ChangesThatWouldBeOverwritten = DataToOverwrite[];

function isNotUndefined<T>(value: T | undefined): value is T {
    return value !== undefined;
}

const getChangedPropertyWithFallbacks =
    (fallbacks: { [key: string]: unknown }) =>
    (
        key: string,
        currentValue: unknown,
        snapshotValue: unknown,
        changeValue: unknown,
    ) => {
        const fallback = fallbacks[key as keyof typeof fallbacks] ?? undefined;
        const diffCheck = key in fallbacks ? hasJsonDiff(fallback) : hasChanged;

        const changeInfo = {
            property: key,
            oldValue: currentValue,
            newValue: changeValue,
        };

        return diffCheck(snapshotValue, currentValue, changeValue)
            ? changeInfo
            : undefined;
    };

type Change<T> = {
    payload: Partial<T> & {
        snapshot?: { [Key in keyof T]: unknown };
    };
};

function getChangesThatWouldBeOverwritten<T>(
    currentConfig: T | undefined,
    change: Change<T>,
    fallbacks: Partial<T>,
): ChangesThatWouldBeOverwritten | null {
    const { snapshot } = change.payload;
    if (!snapshot || !currentConfig) return null;

    const getChangedProperty = getChangedPropertyWithFallbacks(fallbacks);

    const changes: ChangesThatWouldBeOverwritten = Object.entries(currentConfig)
        .map(([key, currentValue]: [string, unknown]) => {
            const snapshotValue = snapshot[key as keyof T];
            const changeValue = change.payload[key as keyof T];

            return getChangedProperty(
                key,
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

export function getEnvVariantChangesThatWouldBeOverwritten(
    currentVariantConfig: IFeatureVariant[] | undefined,
    change: IChangeRequestPatchVariant,
): ChangesThatWouldBeOverwritten | null {
    const { snapshot } = change.payload;
    if (!snapshot || !currentVariantConfig) return null;

    const conflict = getChangedPropertyWithFallbacks({})(
        'variants',
        currentVariantConfig,
        snapshot,
        change.payload.variants,
    );

    return conflict ? [conflict] : null;
}

export function getSegmentChangesThatWouldBeOverwritten(
    currentSegmentConfig: ISegment | undefined,
    change: IChangeRequestUpdateSegment,
): ChangesThatWouldBeOverwritten | null {
    const fallbacks = { description: '' };
    return getChangesThatWouldBeOverwritten(
        omit(currentSegmentConfig, 'createdAt', 'createdBy'),
        change,
        fallbacks,
    );
}

export function getStrategyChangesThatWouldBeOverwritten(
    currentStrategyConfig: IFeatureStrategy | undefined,
    change: IChangeRequestUpdateStrategy,
): ChangesThatWouldBeOverwritten | null {
    const fallbacks = { segments: [], variants: [], title: '' };
    return getChangesThatWouldBeOverwritten(
        omit(currentStrategyConfig, 'strategyName'),
        change,
        fallbacks,
    );
}
