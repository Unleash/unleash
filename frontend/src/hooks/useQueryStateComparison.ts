import { useEffect } from 'react';
import { recordQueryStateDivergence } from 'utils/recordQueryStateDivergence';
import { encodeParams } from 'utils/nuqsParams.ts';
import {
    encodeSpecParams,
    toNuqsParsers,
    type QueryParamSpecMap,
} from 'utils/queryParamSpec';

/**
 * Normalizes a decoded query-param value so the two libraries' outputs can
 * be compared: `undefined` and `null` both mean "absent", and object key
 * order is irrelevant.
 */
const normalize = (value: unknown): unknown => {
    if (value === undefined) {
        return null;
    }
    if (Array.isArray(value)) {
        return value.map(normalize);
    }
    if (value !== null && typeof value === 'object') {
        return Object.fromEntries(
            Object.keys(value)
                .sort()
                .map((key) => [
                    key,
                    normalize((value as Record<string, unknown>)[key]),
                ]),
        );
    }
    return value;
};

const stableSerialize = (value: unknown): string =>
    JSON.stringify(normalize(value)) ?? 'null';

const divergingKeys = (
    first: Record<string, unknown>,
    second: Record<string, unknown>,
): string[] => {
    const keys = new Set([...Object.keys(first), ...Object.keys(second)]);
    return [...keys].filter(
        (key) => stableSerialize(first[key]) !== stableSerialize(second[key]),
    );
};

/** Drops absent entries so "key missing" and "key: undefined/null" compare equal. */
const presentEntries = (record: Record<string, unknown>) =>
    Object.fromEntries(
        Object.entries(record).filter(([, value]) => value != null),
    );

type ComparisonArgs<TSpecs extends QueryParamSpecMap> = {
    enabled: boolean;
    /** Consumer identifier for divergence reports, e.g. the storage key. */
    source: string;
    specs: TSpecs;
    uqpState: Record<string, unknown>;
    nuqsState: Record<string, unknown>;
};

/**
 * Shadow comparison for the dual-run query-param facades: checks that both
 * libraries decode the current URL to the same state, and (when they do)
 * that they encode that state back to the same wire format. Divergence is
 * reported through `recordQueryStateDivergence` with param keys only,
 * never values.
 */
export const useQueryStateComparison = <TSpecs extends QueryParamSpecMap>({
    enabled,
    source,
    specs,
    uqpState,
    nuqsState,
}: ComparisonArgs<TSpecs>) => {
    const uqpSerialized = stableSerialize(uqpState);
    const nuqsSerialized = stableSerialize(nuqsState);

    useEffect(() => {
        if (!enabled) {
            return;
        }
        if (uqpSerialized !== nuqsSerialized) {
            recordQueryStateDivergence({
                source,
                kind: 'decode',
                keys: divergingKeys(uqpState, nuqsState),
            });
            return;
        }
        // Only compare encoders when the decoded states agree; otherwise
        // every decode divergence would be double-reported.
        const uqpEncoded = presentEntries(encodeSpecParams(specs, uqpState));
        const nuqsEncoded = presentEntries(
            encodeParams(toNuqsParsers(specs), uqpState),
        );
        const encodedDiff = divergingKeys(uqpEncoded, nuqsEncoded);
        if (encodedDiff.length > 0) {
            recordQueryStateDivergence({
                source,
                kind: 'encode',
                keys: encodedDiff,
            });
        }
    }, [enabled, uqpSerialized, nuqsSerialized]);
};
