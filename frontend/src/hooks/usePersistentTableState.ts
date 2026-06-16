import { useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { encodeQueryParams, useQueryParams } from 'use-query-params';
import type { QueryParamConfigMap } from 'serialize-query-params/src/types';
import {
    useQueryStates,
    type ParserMap,
    type SetValues,
    type Values,
} from 'nuqs';
import { createLocalStorage } from 'utils/createLocalStorage';
import { encodeParams, encodedParamsToSearchParams } from 'utils/nuqsParams.ts';
import {
    toNuqsParsers,
    toUseQueryParamsConfig,
    type DecodedSpecMap,
    type QueryParamSpecMap,
} from 'utils/queryParamSpec';
import { reorderObject } from '../utils/reorderObject.js';
import {
    isValidPaginationOption,
    DEFAULT_PAGE_LIMIT,
} from 'utils/paginationConfig';
import { useQueryStateLibrary } from './useQueryStateLibrary.ts';
import { useQueryStateComparison } from './useQueryStateComparison.ts';

export type TableStateUpdate<TSpecs extends QueryParamSpecMap> =
    | Partial<DecodedSpecMap<TSpecs>>
    | ((prev: DecodedSpecMap<TSpecs>) => Partial<DecodedSpecMap<TSpecs>>);

export type TableStateSetter<TSpecs extends QueryParamSpecMap> = (
    update: TableStateUpdate<TSpecs>,
) => void;

/**
 * use-query-params implementation. This is the pre-migration
 * `usePersistentTableState` body, parameterized with `active`: when this
 * library is not the flag-selected primary, the hook still decodes (for
 * shadow comparison) but suppresses all side effects — the localStorage
 * restore/sync and the pagination-limit correction — so only one library
 * ever writes.
 */
const useUqpPersistentSearchParams = (
    key: string,
    queryParamsDefinition: QueryParamConfigMap,
    active: boolean,
) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { value, setValue } = createLocalStorage<Record<string, unknown>>(
        key,
        {},
    );
    useEffect(() => {
        if (!active) {
            return;
        }
        const params = Object.fromEntries(searchParams.entries());
        if (Object.keys(params).length > 0) {
            return;
        }
        if (Object.keys(value).length === 0) {
            return;
        }
        setSearchParams(
            encodeQueryParams(queryParamsDefinition, value) as Record<
                string,
                string
            >,
            { replace: true },
        );
    }, [active]);

    return setValue;
};

const useUqpTableState = (
    key: string,
    queryParamsDefinition: QueryParamConfigMap,
    excludedFromStorage: string[],
    active: boolean,
) => {
    const updateStoredParams = useUqpPersistentSearchParams(
        key,
        queryParamsDefinition,
        active,
    );

    const [tableState, setTableStateInternal] = useQueryParams(
        queryParamsDefinition,
        { updateType: 'replaceIn' },
    );

    const [searchParams] = useSearchParams();
    const orderedTableState = useMemo(() => {
        return reorderObject(tableState, [...searchParams.keys()]);
    }, [searchParams, tableState, reorderObject]);

    useEffect(() => {
        if (
            active &&
            tableState.limit &&
            !isValidPaginationOption(tableState.limit)
        ) {
            setTableStateInternal((prevState) => ({
                ...prevState,
                limit: DEFAULT_PAGE_LIMIT,
                offset: 0, // Reset offset when changing limit
            }));
        }
    }, [active, tableState.limit, setTableStateInternal]);

    type SetTableStateInternalParam = Parameters<
        typeof setTableStateInternal
    >[0];

    const setTableState = useCallback(
        (newState: SetTableStateInternalParam) => {
            if (!queryParamsDefinition.offset) {
                return setTableStateInternal(newState);
            }
            if (typeof newState === 'function') {
                setTableStateInternal((prevState) => {
                    const updatedState = (newState as Function)(prevState);
                    return queryParamsDefinition.offset
                        ? {
                              offset: queryParamsDefinition.offset.decode('0'),
                              ...updatedState,
                          }
                        : updatedState;
                });
            } else {
                const updatedState = queryParamsDefinition.offset
                    ? {
                          offset: queryParamsDefinition.offset.decode('0'),
                          ...newState,
                      }
                    : newState;
                setTableStateInternal(updatedState);
            }
        },
        [setTableStateInternal, queryParamsDefinition.offset],
    );

    useEffect(() => {
        if (!active) {
            return;
        }
        const filteredTableState = Object.fromEntries(
            Object.entries(orderedTableState).filter(
                ([key]) => !excludedFromStorage.includes(key),
            ),
        );
        updateStoredParams(filteredTableState);
    }, [active, JSON.stringify(orderedTableState)]);

    return [orderedTableState, setTableState] as const;
};

/**
 * nuqs implementation, same contract and the same `active` gating.
 */
const useNuqsPersistentSearchParams = (
    key: string,
    parsers: ParserMap,
    active: boolean,
) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { value, setValue } = createLocalStorage<Record<string, unknown>>(
        key,
        {},
    );
    useEffect(() => {
        if (!active) {
            return;
        }
        const params = Object.fromEntries(searchParams.entries());
        if (Object.keys(params).length > 0) {
            return;
        }
        if (Object.keys(value).length === 0) {
            return;
        }
        setSearchParams(
            encodedParamsToSearchParams(encodeParams(parsers, value)),
            { replace: true },
        );
    }, [active]);

    return setValue;
};

const useNuqsTableState = <T extends ParserMap>(
    key: string,
    parsers: T,
    excludedFromStorage: string[],
    active: boolean,
) => {
    const [tableState, setTableStateInternal] = useQueryStates(parsers, {
        history: 'replace',
        shallow: false,
    });

    // Must come AFTER useQueryStates: the localStorage restore navigates in
    // a mount effect, and nuqs only sees history updates through an emitter
    // it subscribes to in its own mount effect. Hook order = effect order,
    // so subscribing first is what keeps the restore from being lost.
    const updateStoredParams = useNuqsPersistentSearchParams(
        key,
        parsers,
        active,
    );

    const [searchParams] = useSearchParams();
    const orderedTableState = useMemo(() => {
        return reorderObject(tableState, [...searchParams.keys()]);
    }, [searchParams, tableState, reorderObject]);

    useEffect(() => {
        if (
            active &&
            tableState.limit &&
            !isValidPaginationOption(tableState.limit)
        ) {
            setTableStateInternal((prevState) => ({
                ...prevState,
                limit: DEFAULT_PAGE_LIMIT,
                offset: 0, // Reset offset when changing limit
            }));
        }
    }, [active, tableState.limit, setTableStateInternal]);

    type SetTableStateInternalParam = Parameters<SetValues<T>>[0];

    // TS cannot prove 'offset' is a key of the generic parser map; the
    // runtime guard on parsers.offset is what actually ensures it.
    const offsetReset = { offset: 0 } as Partial<{
        [K in keyof Values<T>]: Values<T>[K] | null;
    }>;

    const setTableState = useCallback(
        (newState: SetTableStateInternalParam) => {
            if (!parsers.offset) {
                return setTableStateInternal(newState);
            }
            if (typeof newState === 'function') {
                setTableStateInternal((prevState) => ({
                    ...offsetReset,
                    ...newState(prevState),
                }));
            } else {
                setTableStateInternal({
                    ...offsetReset,
                    ...newState,
                });
            }
        },
        [setTableStateInternal, parsers.offset],
    );

    useEffect(() => {
        if (!active) {
            return;
        }
        const filteredTableState = Object.fromEntries(
            Object.entries(orderedTableState).filter(
                ([key, value]) =>
                    !excludedFromStorage.includes(key) &&
                    value !== null &&
                    value !== undefined,
            ),
        );
        updateStoredParams(filteredTableState);
    }, [active, JSON.stringify(orderedTableState)]);

    return [orderedTableState, setTableState] as const;
};

/**
 * Persistent (URL + localStorage) table state, dual-run during the
 * use-query-params → nuqs migration.
 *
 * Both library implementations always run (Rules of Hooks: the flag value
 * can change mid-session, so we cannot call hooks conditionally). The
 * flag-selected primary drives reads, writes, and persistence; the other
 * library decodes the same URL read-only as a shadow, and
 * `useQueryStateComparison` reports any divergence between the two.
 */
export const usePersistentTableState = <TSpecs extends QueryParamSpecMap>(
    key: string,
    specs: TSpecs,
    excludedFromStorage: (keyof TSpecs)[] = ['offset'],
) => {
    const { primary, compare } = useQueryStateLibrary();
    const excluded = excludedFromStorage as string[];

    const [uqpState, setUqpState] = useUqpTableState(
        key,
        toUseQueryParamsConfig(specs),
        excluded,
        primary === 'use-query-params',
    );
    const [nuqsState, setNuqsState] = useNuqsTableState(
        key,
        toNuqsParsers(specs),
        excluded,
        primary === 'nuqs',
    );

    useQueryStateComparison({
        enabled: compare,
        source: key,
        specs,
        uqpState,
        nuqsState,
    });

    const tableState = (
        primary === 'nuqs' ? nuqsState : uqpState
    ) as DecodedSpecMap<TSpecs>;
    const setTableState = (
        primary === 'nuqs' ? setNuqsState : setUqpState
    ) as TableStateSetter<TSpecs>;

    return [tableState, setTableState] as const;
};
