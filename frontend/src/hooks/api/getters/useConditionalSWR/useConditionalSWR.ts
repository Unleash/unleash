import useSWR, {
    type BareFetcher,
    type Key,
    type SWRConfiguration,
    type SWRResponse,
} from 'swr';

export const useConditionalSWR = <Data = any, Error = any, T = boolean>(
    condition: T,
    fallback: Data,
    key: Key,
    fetcher: BareFetcher<Data>,
    options: SWRConfiguration = {},
): SWRResponse<Data, Error> => {
    const result = useSWR(condition ? key : null, fetcher, options);

    // Explicitly map each property. Spreading the result here makes it so that
    // every consumer is subscribed to every property, even if it doesn't use it
    // (e.g. isValidating and isLoading).
    return {
        get data() {
            return condition ? result.data : fallback;
        },
        get error() {
            return condition ? result.error : undefined;
        },
        get isValidating() {
            return result.isValidating;
        },
        get isLoading() {
            return result.isLoading;
        },
        mutate: result.mutate,
    };
};
