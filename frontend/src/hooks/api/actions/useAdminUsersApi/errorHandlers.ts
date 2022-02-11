import { Dispatch, SetStateAction } from 'react';

import {
    AuthenticationError,
    ForbiddenError,
    NotFoundError,
} from '../../../../utils/api-utils';

export const handleBadRequest = async (
    setErrors?: Dispatch<SetStateAction<{}>>,
    res?: Response,
    requestId?: string
) => {
    if (!setErrors || !requestId) return;
    if (res) {
        const data = await res.json();

        setErrors(prev => ({
            ...prev,
            [requestId]: data[0].msg,
        }));
    }

    throw new Error();
};

export const handleNotFound = (
    setErrors?: Dispatch<SetStateAction<{}>>,
    res?: Response,
    requestId?: string
) => {
    if (!setErrors || !requestId) return;

    setErrors(prev => ({
        ...prev,
        [requestId]: 'Could not find the requested resource.',
    }));

    throw new NotFoundError(res?.status);
};

export const handleUnauthorized = async (
    setErrors?: Dispatch<SetStateAction<{}>>,
    res?: Response,
    requestId?: string
) => {
    if (!setErrors || !requestId) return;
    if (res) {
        const data = await res.json();

        setErrors(prev => ({
            ...prev,
            [requestId]: data[0].msg,
        }));
    }

    throw new AuthenticationError(res?.status);
};

export const handleForbidden = async (
    setErrors?: Dispatch<SetStateAction<{}>>,
    res?: Response,
    requestId?: string
) => {
    if (!setErrors || !requestId) return;
    if (res) {
        const data = await res.json();

        const message = data.isJoi ? data.details[0].message : data[0].msg;

        setErrors(prev => ({
            ...prev,
            [requestId]: message,
        }));
    }

    throw new ForbiddenError(res?.status);
};
