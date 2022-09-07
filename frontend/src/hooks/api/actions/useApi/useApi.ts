import { Dispatch, SetStateAction, useCallback, useState } from 'react';
import {
    BAD_REQUEST,
    FORBIDDEN,
    NOT_FOUND,
    OK,
    UNAUTHORIZED,
} from 'constants/statusCodes';
import {
    AuthenticationError,
    BadRequestError,
    ForbiddenError,
    headers,
    NotFoundError,
} from 'utils/apiUtils';
import { formatApiPath } from 'utils/formatPath';
import { ACCESS_DENIED_TEXT } from 'utils/formatAccessText';

type ApiErrorHandler = (
    setErrors: Dispatch<SetStateAction<{}>>,
    res: Response,
    requestId: string
) => void;

interface IUseAPI {
    handleBadRequest?: ApiErrorHandler;
    handleNotFound?: ApiErrorHandler;
    handleUnauthorized?: ApiErrorHandler;
    handleForbidden?: ApiErrorHandler;
    propagateErrors?: boolean;
}

const useAPI = ({
    handleBadRequest,
    handleNotFound,
    handleForbidden,
    handleUnauthorized,
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
                    setErrors(prev => ({
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
                    setErrors(prev => ({
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
                    setErrors(prev => ({
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
                    setErrors(prev => ({
                        ...prev,
                        forbidden: 'This operation is forbidden',
                    }));
                }

                if (propagateErrors) {
                    const response = await res.json();
                    throw new ForbiddenError(res.status, response);
                }
            }

            if (res.status > 399) {
                const response = await res.json();
                if (response?.details?.length > 0 && propagateErrors) {
                    const error = response.details[0];
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
        ]
    );

    const makeRequest = useCallback(
        async (
            apiCaller: () => Promise<Response>,
            requestId: string,
            loadingOn: boolean = true
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
        [handleResponses]
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
        []
    );

    return {
        loading,
        makeRequest,
        createRequest,
        errors,
    };
};

export default useAPI;
