import { useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import {
    useQueryStates,
    type ParserMap,
    type Values,
    type SetValues,
} from 'nuqs';
import { createLocalStorage } from 'utils/createLocalStorage';
import { encodeParams, encodedParamsToSearchParams } from 'utils/nuqsParams.ts';
import { reorderObject } from '../utils/reorderObject.js';
import {
    isValidPaginationOption,
    DEFAULT_PAGE_LIMIT,
} from 'utils/paginationConfig';

/**
 * nuqs port of `usePersistentTableState`. Same contract:
 * - URL params win over localStorage on mount; storage only seeds an
 *   otherwise empty URL
 * - `offset` resets to 0 on every state update and is excluded from storage
 * - returned state keys are ordered to match the URL param order
 *
 * `shallow: false` routes URL updates through react-router navigation
 * (like the old use-query-params adapter did), keeping `useSearchParams`
 * and `useLocation` consumers in sync with query-param writes.
 */
const usePersistentSearchParams = <T extends ParserMap>(
    key: string,
    parsers: T,
) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { value, setValue } = createLocalStorage<Record<string, unknown>>(
        key,
        {},
    );
    useEffect(() => {
        const params = Object.fromEntries(searchParams.entries());
        if (Object.keys(params).length > 0) {
            return;
        }
        if (Object.keys(value).length === 0) {
            return;
        }
        setSearchParams(
            encodedParamsToSearchParams(encodeParams(parsers, value)),
            {
                replace: true,
            },
        );
    }, []);

    return setValue;
};

export const usePersistentTableState = <T extends ParserMap>(
    key: string,
    parsers: T,
    excludedFromStorage: (keyof T)[] = ['offset'],
) => {
    const [tableState, setTableStateInternal] = useQueryStates(parsers, {
        history: 'replace',
        shallow: false,
    });

    // Must come AFTER useQueryStates: the localStorage restore navigates in
    // a mount effect, and nuqs only sees history updates through an emitter
    // it subscribes to in its own mount effect. Hook order = effect order,
    // so subscribing first is what keeps the restore from being lost.
    const updateStoredParams = usePersistentSearchParams(key, parsers);

    const [searchParams] = useSearchParams();
    const orderedTableState = useMemo(() => {
        return reorderObject(tableState, [...searchParams.keys()]);
    }, [searchParams, tableState, reorderObject]);

    useEffect(() => {
        if (tableState.limit && !isValidPaginationOption(tableState.limit)) {
            setTableStateInternal((prevState) => ({
                ...prevState,
                limit: DEFAULT_PAGE_LIMIT,
                offset: 0, // Reset offset when changing limit
            }));
        }
    }, [tableState.limit, setTableStateInternal]);

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
        const filteredTableState = Object.fromEntries(
            Object.entries(orderedTableState).filter(
                ([key, value]) =>
                    !excludedFromStorage.includes(key) &&
                    value !== null &&
                    value !== undefined,
            ),
        );
        updateStoredParams(filteredTableState);
    }, [JSON.stringify(orderedTableState)]);

    return [orderedTableState as Values<T>, setTableState] as const;
};
