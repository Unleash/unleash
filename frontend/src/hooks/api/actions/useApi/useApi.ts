import { useState, Dispatch, SetStateAction } from 'react';
import {
    BAD_REQUEST,
    FORBIDDEN,
    NOT_FOUND,
    OK,
    UNAUTHORIZED,
} from '../../../../constants/statusCodes';
import {
    AuthenticationError,
    BadRequestError,
    ForbiddenError,
    headers,
    NotFoundError,
} from '../../../../utils/api-utils';
import { formatApiPath } from '../../../../utils/format-path';

interface IUseAPI {
    handleBadRequest?: (
        setErrors?: Dispatch<SetStateAction<{}>>,
        res?: Response,
        requestId?: string
    ) => void;
    handleNotFound?: (
        setErrors?: Dispatch<SetStateAction<{}>>,
        res?: Response,
        requestId?: string
    ) => void;
    handleUnauthorized?: (
        setErrors?: Dispatch<SetStateAction<{}>>,
        res?: Response,
        requestId?: string
    ) => void;
    handleForbidden?: (
        setErrors?: Dispatch<SetStateAction<{}>>,
        res?: Response,
        requestId?: string
    ) => void;
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

    const defaultOptions: RequestInit = {
        headers,
        credentials: 'include',
    };

    const makeRequest = async (
        apiCaller: any,
        requestId?: string,
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
    };

    const createRequest = (
        path: string,
        options: any,
        requestId: string = ''
    ) => {
        return {
            caller: () => {
                return fetch(formatApiPath(path), {
                    ...defaultOptions,
                    ...options,
                });
            },
            id: requestId,
        };
    };

    const handleResponses = async (res: Response, requestId?: string) => {
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
                    unauthorized:
                        'You are not authorized to perform this operation',
                }));
            }

            if (propagateErrors) {
                throw new AuthenticationError(res.status);
            }
        }

        if (res.status === FORBIDDEN) {
            if (handleForbidden) {
                return handleForbidden(setErrors);
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
    };

    return {
        loading,
        makeRequest,
        createRequest,
        errors,
    };
};

export default useAPI;
