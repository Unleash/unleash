import {
    BAD_REQUEST,
    FORBIDDEN,
    NOT_FOUND,
    UNAUTHORIZED,
} from 'constants/statusCodes';

export interface IErrorBody {
    details?: { message: string }[];
}

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
        super(
            body.details?.length
                ? body.details[0].message
                : 'You cannot perform this action'
        );
        this.name = 'ForbiddenError';
        this.statusCode = statusCode;
        this.body = body;
    }
}

export class BadRequestError extends Error {
    statusCode: number;
    body: IErrorBody;

    constructor(statusCode: number = BAD_REQUEST, body: IErrorBody = {}) {
        super(body.details?.length ? body.details[0].message : 'Bad request');
        this.name = 'BadRequestError';
        this.statusCode = statusCode;
        this.body = body;
    }
}

export class NotFoundError extends Error {
    statusCode: number;

    constructor(statusCode: number = NOT_FOUND) {
        super(
            'The requested resource could not be found but may be available in the future'
        );
        this.name = 'NotFoundError';
        this.statusCode = statusCode;
    }
}

export const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
};
