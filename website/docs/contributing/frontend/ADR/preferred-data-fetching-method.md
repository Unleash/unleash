---
title: "ADR: Preferred data fetching method"
---

## Background

We have found a need to standardise how we fetch data from APIs, in order to reduce complexity and simplify the data fetching process.

## Decision

We have decided to remove redux from our application and fetch all of our data via a third party library called `useSWR` (SWR stands for stale-while-revalidate and is a common cache strategy).

```tsx
// Do:
// useSegments.ts

import useSWR from 'swr';
import { useCallback } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { ISegment } from 'interfaces/segment';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { IFlags } from 'interfaces/uiConfig';

export interface UseSegmentsOutput {
    segments?: ISegment[];
    refetchSegments: () => void;
    loading: boolean;
    error?: Error;
}

export const useSegments = (strategyId?: string): UseSegmentsOutput => {
    const { uiConfig } = useUiConfig();

    const { data, error, mutate } = useSWR(
        [strategyId, uiConfig.flags],
        fetchSegments
    );

    const refetchSegments = useCallback(() => {
        mutate().catch(console.warn);
    }, [mutate]);

    return {
        segments: data,
        refetchSegments,
        loading: !error && !data,
        error,
    };
};

export const fetchSegments = async (
    strategyId?: string,
    flags?: IFlags
): Promise<ISegment[]> => {
    if (!flags?.SE) {
        return [];
    }

    return fetch(formatSegmentsPath(strategyId))
        .then(handleErrorResponses('Segments'))
        .then(res => res.json())
        .then(res => res.segments);
};

const formatSegmentsPath = (strategyId?: string): string => {
    return strategyId
        ? formatApiPath(`api/admin/segments/strategies/${strategyId}`)
        : formatApiPath('api/admin/segments');
};

// Don't:
const MyComponent = () => {
    useEffect(() => {
        const getData = () => {
            fetch(API_URL)
                .then(res => res.json())
                .then(setData);
        };
        getData();
    }, []);
};
```
