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
) =>
    typeof snapshotValue === 'object'
        ? !isEqual(snapshotValue, currentValue) ||
          !isEqual(currentValue, changeValue)
        : hasJsonDiff({ snapshotValue, currentValue, changeValue });

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
    if (!snapshot || !currentStrategyConfig) return null;

    const changes: ChangesThatWouldBeOverwritten = Object.entries(
        omit(currentStrategyConfig, 'strategyName'),
    )
        .map(([key, currentValue]: [string, unknown]) => {
            const snapshotValue = snapshot[key as keyof IFeatureStrategy];
            const changeValue =
                change.payload[key as keyof ChangeRequestEditStrategy];
            const fallbacks = { segments: [], variants: [], title: '' };
            const fallback =
                fallbacks[key as keyof typeof fallbacks] ?? undefined;

            if (
                hasJsonDiff({
                    snapshotValue,
                    currentValue,
                    changeValue,
                    fallback,
                })
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
        changes.sort((a, b) => a.property.localeCompare(b.property));
        return changes;
    }

    return null;
};
