import {
    BAD_REQUEST,
    CONFLICT,
    FORBIDDEN,
    NOT_FOUND,
    UNAUTHORIZED,
    UNAVAILABLE,
} from 'constants/statusCodes';

export interface IErrorBody {
    message?: string;
    details?: { message: string }[];
}

const getErrorMessage = (body: IErrorBody) =>
    body.details?.[0]?.message || body.message;

export class AuthenticationError extends Error {
    statusCode: number;

    constructor(statusCode: number = UNAUTHORIZED) {
        super('Authentication required');
        this.name = 'AuthenticationError';
        this.statusCode = statusCode;
    }
}

export class ForbiddenError extends Error {
    statusCode: number;
    body: IErrorBody;

    constructor(statusCode: number = FORBIDDEN, body: IErrorBody = {}) {
        super(getErrorMessage(body) || 'You cannot perform this action');
        this.name = 'ForbiddenError';
        this.statusCode = statusCode;
        this.body = body;
    }
}

export class UnavailableError extends Error {
    statusCode: number;
    body: IErrorBody;

    constructor(statusCode: number = UNAVAILABLE, body: IErrorBody = {}) {
        super(getErrorMessage(body) || 'This operation is unavailable');
        this.name = 'UnavailableError';
        this.statusCode = statusCode;
        this.body = body;
    }
}

export class BadRequestError extends Error {
    statusCode: number;
    body: IErrorBody;

    constructor(statusCode: number = BAD_REQUEST, body: IErrorBody = {}) {
        super(getErrorMessage(body) || 'Bad request');
        this.name = 'BadRequestError';
        this.statusCode = statusCode;
        this.body = body;
    }
}

export class NotFoundError extends Error {
    statusCode: number;

    constructor(statusCode: number = NOT_FOUND) {
        super('The requested resource could not be found.');
        this.name = 'NotFoundError';
        this.statusCode = statusCode;
    }
}

export class ConflictError extends Error {
    statusCode: number;
    body: IErrorBody;

    constructor(statusCode: number = CONFLICT, body: IErrorBody = {}) {
        super(getErrorMessage(body) || 'Conflict');
        this.name = 'ConflictError';
        this.statusCode = statusCode;
        this.body = body;
    }
}

export class ResponseError extends Error {
    status: number;
    body: unknown;

    constructor(target: string, status: number, body: unknown) {
        super(`An error occurred while trying to get ${target}.`);
        this.name = 'ResponseError';
        this.status = status;
        this.body = body;
    }
}

export const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
};

export type ApiErrorCategory =
    | 'validation'
    | 'permission'
    | 'not-found'
    | 'conflict'
    | 'unavailable'
    | 'server'
    | 'network'
    | 'unknown';

// Low-cardinality bucket for analytics props; never expose the error message.
export const apiErrorCategory = (error: unknown): ApiErrorCategory => {
    if (error instanceof BadRequestError) return 'validation';
    if (error instanceof AuthenticationError || error instanceof ForbiddenError)
        return 'permission';
    if (error instanceof NotFoundError) return 'not-found';
    if (error instanceof ConflictError) return 'conflict';
    if (error instanceof UnavailableError) return 'unavailable';
    if (error instanceof ResponseError) return 'server';
    if (error instanceof TypeError) return 'network';
    return 'unknown';
};
