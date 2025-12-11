import {
    type Dispatch,
    type SetStateAction,
    useCallback,
    useState,
} from 'react';
import {
    BAD_REQUEST,
    FORBIDDEN,
    NOT_FOUND,
    OK,
    UNAUTHORIZED,
    UNAVAILABLE,
} from 'constants/statusCodes';
import {
    AuthenticationError,
    BadRequestError,
    ForbiddenError,
    headers,
    NotFoundError,
    UnavailableError,
} from 'utils/apiUtils';
import { formatApiPath } from 'utils/formatPath';
import { ACCESS_DENIED_TEXT } from 'utils/formatAccessText';

type ApiErrorHandler = (
    setErrors: Dispatch<SetStateAction<{}>>,
    res: Response,
    requestId: string,
) => void;

type ApiCaller = () => Promise<Response>;
type RequestFunction = (
    apiCaller: ApiCaller,
    requestId: string,
    loadingOn?: boolean,
) => Promise<Response>;

interface IUseAPI {
    handleBadRequest?: ApiErrorHandler;
    handleNotFound?: ApiErrorHandler;
    handleUnauthorized?: ApiErrorHandler;
    handleForbidden?: ApiErrorHandler;
    handleUnavailable?: ApiErrorHandler;
    propagateErrors?: boolean;
}

const timeApiCallStart = (requestId: string) => {
    // Store the start time in milliseconds
    console.log(`[DEVELOPMENT LOG] Starting timing for request: ${requestId}`);
    return Date.now();
};

const timeApiCallEnd = (startTime: number, requestId: string) => {
    // Calculate the end time and subtract the start time
    const endTime = Date.now();
    const duration = endTime - startTime;
    console.log(
        `[DEVELOPMENT LOG] Timing for request ${requestId}: ${duration} ms`,
    );

    if (duration > 500) {
        console.error(
            '[DEVELOPMENT LOG] API call took over 500ms. This may indicate a rendering performance problem in your React component.',
            requestId,
            duration,
        );
    }

    return duration;
};

const useAPI = ({
    handleBadRequest,
    handleNotFound,
    handleForbidden,
    handleUnauthorized,
    handleUnavailable,
    propagateErrors = false,
}: IUseAPI) => {
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const handleResponses = useCallback(
        async (res: Response, requestId: string) => {
            if (res.status === BAD_REQUEST) {
                if (handleBadRequest) {
                    return handleBadRequest(setErrors, res, requestId);
                } else {
                    setErrors((prev) => ({
                        ...prev,
                        badRequest: 'Bad request format',
                    }));
                }

                if (propagateErrors) {
                    const response = await res.json();
                    throw new BadRequestError(res.status, response);
                }
            }

            if (res.status === NOT_FOUND) {
                if (handleNotFound) {
                    return handleNotFound(setErrors, res, requestId);
                } else {
                    setErrors((prev) => ({
                        ...prev,
                        notFound: 'Could not find the requested resource',
                    }));
                }

                if (propagateErrors) {
                    throw new NotFoundError(res.status);
                }
            }

            if (res.status === UNAUTHORIZED) {
                if (handleUnauthorized) {
                    return handleUnauthorized(setErrors, res, requestId);
                } else {
                    setErrors((prev) => ({
                        ...prev,
                        unauthorized: ACCESS_DENIED_TEXT,
                    }));
                }

                if (propagateErrors) {
                    throw new AuthenticationError(res.status);
                }
            }

            if (res.status === FORBIDDEN) {
                if (handleForbidden) {
                    return handleForbidden(setErrors, res, requestId);
                } else {
                    setErrors((prev) => ({
                        ...prev,
                        forbidden: 'This operation is forbidden',
                    }));
                }

                if (propagateErrors) {
                    const response = await res.json();
                    throw new ForbiddenError(res.status, response);
                }
            }

            if (res.status === UNAVAILABLE) {
                if (handleUnavailable) {
                    return handleUnavailable(setErrors, res, requestId);
                } else {
                    setErrors((prev) => ({
                        ...prev,
                        unavailable: 'This operation is unavailable',
                    }));
                }

                if (propagateErrors) {
                    const response = await res.json();
                    throw new UnavailableError(res.status, response);
                }
            }

            if (res.status > 399) {
                const response = await res.json();
                if (response?.details?.length > 0 && propagateErrors) {
                    const error = response.details[0];
                    setErrors((prev) => ({
                        ...prev,
                        unknown: error,
                    }));
                    if (propagateErrors) {
                        throw new Error(error.message || error.msg);
                    }
                    return error;
                }

                if (response?.length > 0 && propagateErrors) {
                    const error = response[0];
                    throw new Error(error.message || error.msg);
                }

                if (propagateErrors) {
                    throw new Error('Action could not be performed');
                }
            }
        },
        [
            handleBadRequest,
            handleForbidden,
            handleNotFound,
            handleUnauthorized,
            propagateErrors,
        ],
    );

    const requestWithTimer = (requestFunction: RequestFunction) => {
        return async (
            apiCaller: () => Promise<Response>,
            requestId: string,
            loadingOn: boolean = true,
        ) => {
            const start = timeApiCallStart(
                requestId || `Unknown request happening on ${apiCaller}`,
            );

            const res = await requestFunction(apiCaller, requestId, loadingOn);

            timeApiCallEnd(
                start,
                requestId || `Unknown request happening on ${apiCaller}`,
            );

            return res;
        };
    };

    const makeRequest = useCallback(
        async (
            apiCaller: () => Promise<Response>,
            requestId: string,
            loadingOn: boolean = true,
        ): Promise<Response> => {
            if (loadingOn) {
                setLoading(true);
            }

            try {
                const res = await apiCaller();
                setLoading(false);
                if (res.status > 299) {
                    await handleResponses(res, requestId);
                }

                if (res.status === OK) {
                    setErrors({});
                }

                return res;
            } catch (e) {
                setLoading(false);
                throw e;
            }
        },
        [handleResponses],
    );

    const makeLightRequest = useCallback(
        async (
            apiCaller: () => Promise<Response>,
            _requestId: string,
            _loadingOn: boolean = true,
        ): Promise<Response> => {
            try {
                const res = await apiCaller();

                if (!res.ok) {
                    throw new Error();
                }

                return res;
            } catch (_e) {
                throw new Error('Could not make request | makeLightRequest');
            }
        },
        [],
    );

    const createRequest = useCallback(
        (path: string, options: any, requestId: string = '') => {
            const defaultOptions: RequestInit = {
                headers,
                credentials: 'include',
            };

            return {
                caller: () => {
                    return fetch(formatApiPath(path), {
                        ...defaultOptions,
                        ...options,
                    });
                },
                id: requestId,
            };
        },
        [],
    );

    const makeRequestWithTimer = requestWithTimer(makeRequest);
    const makeLightRequestWithTimer = requestWithTimer(makeLightRequest);

    const isDevelopment = process.env.NODE_ENV === 'development';

    return {
        loading,
        makeRequest: isDevelopment ? makeRequestWithTimer : makeRequest,
        makeLightRequest: isDevelopment
            ? makeLightRequestWithTimer
            : makeLightRequest,
        createRequest,
        errors,
    };
};

export default useAPI;
