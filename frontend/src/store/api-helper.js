const defaultErrorMessage = 'Unexpected exception when talking to unleash-api';

function extractJoiMsg(body) {
    return body.details.length > 0
        ? body.details[0].message
        : defaultErrorMessage;
}
function extractLegacyMsg(body) {
    return body && body.length > 0 ? body[0].msg : defaultErrorMessage;
}

class ServiceError extends Error {
    constructor(statusCode = 500) {
        super(defaultErrorMessage);
        this.name = 'ServiceError';
        this.statusCode = statusCode;
    }
}

export class AuthenticationError extends Error {
    constructor(statusCode, body) {
        super('Authentication required');
        this.name = 'AuthenticationError';
        this.statusCode = statusCode;
        this.body = body;
    }
}

export class ForbiddenError extends Error {
    constructor(statusCode, body) {
        super('You cannot perform this action');
        this.name = 'ForbiddenError';
        this.statusCode = statusCode;
        this.body = body;
    }
}

export class NotFoundError extends Error {
    constructor(statusCode) {
        super(
            'The requested resource could not be found but may be available in the future'
        );
        this.name = 'NotFoundError';
        this.statusCode = statusCode;
    }
}

export function throwIfNotSuccess(response) {
    if (!response.ok) {
        if (response.status === 401) {
            return new Promise((resolve, reject) => {
                response
                    .json()
                    .then(body =>
                        reject(new AuthenticationError(response.status, body))
                    );
            });
        } else if (response.status === 403) {
            return new Promise((resolve, reject) => {
                response
                    .json()
                    .then(body =>
                        reject(new ForbiddenError(response.status, body))
                    );
            });
        } else if (response.status === 404) {
            return new Promise((resolve, reject) => {
                reject(new NotFoundError(response.status));
            });
        } else if (response.status > 399 && response.status < 501) {
            return new Promise((resolve, reject) => {
                response
                    .json()
                    .then(body => {
                        const errorMsg =
                            body && body.isJoi
                                ? extractJoiMsg(body)
                                : extractLegacyMsg(body);
                        let error = new Error(errorMsg);
                        error.statusCode = response.status;
                        reject(error);
                    })
                    .catch(() => reject(new Error(defaultErrorMessage)));
            });
        } else {
            return Promise.reject(new ServiceError(response.status));
        }
    }
    return Promise.resolve(response);
}

export const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
};
