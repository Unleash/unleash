import { useCallback } from 'react';
import { useQueryParams } from 'use-query-params';
import { useQueryStates } from 'nuqs';
import {
    toNuqsParsers,
    toUseQueryParamsConfig,
    type DecodedSpecMap,
    type QueryParamSpec,
    type QueryParamSpecMap,
} from 'utils/queryParamSpec';
import { useQueryStateLibrary } from './useQueryStateLibrary.ts';
import { useQueryStateComparison } from './useQueryStateComparison.ts';

export type DualQueryParamsOptions = {
    /** Consumer identifier for divergence reports. */
    source: string;
    /** Whether updates push a history entry or replace the current one. */
    history: 'push' | 'replace';
};

export type DualQueryParamsSetter<TSpecs extends QueryParamSpecMap> = (
    update:
        | Partial<DecodedSpecMap<TSpecs>>
        | ((prev: DecodedSpecMap<TSpecs>) => Partial<DecodedSpecMap<TSpecs>>),
) => void;

/**
 * Non-persistent equivalent of `usePersistentTableState`'s dual-run setup,
 * replacing direct `useQueryParams` calls during the use-query-params →
 * nuqs migration. Both libraries always decode (Rules of Hooks); the
 * flag-selected primary handles writes, the shadow is compared read-only.
 */
export const useDualQueryParams = <TSpecs extends QueryParamSpecMap>(
    specs: TSpecs,
    { source, history }: DualQueryParamsOptions,
) => {
    const { primary, compare } = useQueryStateLibrary();

    const [uqpState, setUqpState] = useQueryParams(
        toUseQueryParamsConfig(specs),
        { updateType: history === 'replace' ? 'replaceIn' : 'pushIn' },
    );
    const [nuqsState, setNuqsState] = useQueryStates(toNuqsParsers(specs), {
        history,
        shallow: false,
    });

    useQueryStateComparison({
        enabled: compare,
        source,
        specs,
        uqpState,
        nuqsState,
    });

    const state = (
        primary === 'nuqs' ? nuqsState : uqpState
    ) as DecodedSpecMap<TSpecs>;
    const setState = (
        primary === 'nuqs' ? setNuqsState : setUqpState
    ) as DualQueryParamsSetter<TSpecs>;

    return [state, setState] as const;
};

/**
 * Single-param variant, replacing direct `useQueryParam` calls.
 */
export const useDualQueryParam = <TDecoded>(
    name: string,
    spec: QueryParamSpec<TDecoded>,
    options: DualQueryParamsOptions,
): readonly [TDecoded, (value: TDecoded) => void] => {
    const [state, setState] = useDualQueryParams({ [name]: spec }, options);
    const setValue = useCallback(
        (value: TDecoded) => {
            setState({ [name]: value } as Partial<
                Record<string, TDecoded>
            > as Parameters<typeof setState>[0]);
        },
        [name, setState],
    );
    return [state[name] as TDecoded, setValue] as const;
};
