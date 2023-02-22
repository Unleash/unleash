import { formatApiPath } from 'utils/formatPath';

/**
 * Customize HTTP client, use Fetch instead of Axios
 * @see https://orval.dev/guides/custom-client
 */
export const fetcher = async <T>({
    url,
    method,
    params,
    data,
    headers,
    credentials = 'include',
}: {
    url: string;
    method: 'get' | 'post' | 'put' | 'delete' | 'patch';
    params?: string | URLSearchParams | Record<string, string> | string[][];
    data?: BodyType<unknown>;
    headers?: HeadersInit;
    credentials?: RequestCredentials;
}): Promise<T> => {
    const response = await fetch(
        `${formatApiPath(url)}${new URLSearchParams(params)}`,
        {
            method,
            credentials,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                ...headers,
            },
            ...(data ? { body: JSON.stringify(data) } : {}),
        }
    );

    return response.json();
};

export default fetcher;

/**
 * In some case with react-query and swr you want to be able to override the return error type so you can also do it here like this
 */
export type ErrorType<Error> = Error;

/**
 * In case you want to wrap the body type (optional)
 * (if the custom instance is processing data before sending it, like changing the case for example)
 */
export type BodyType<BodyData> = BodyData;
