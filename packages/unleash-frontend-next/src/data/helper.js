const defaultErrorMessage = 'Unexptected exception when talking to unleash-api';

export function throwIfNotSuccess (response) {
    if (!response.ok) {
        if (response.status > 399 && response.status < 404) {
            return new Promise((resolve, reject) => {
                response.json().then(body => {
                    const errorMsg = body && body.length > 0 ? body[0].msg : defaultErrorMessage;
                    let error = new Error(errorMsg);
                    error.statusCode = response.status;
                    reject(error);
                });
            });
        } else {
            return Promise.reject(new Error(defaultErrorMessage));
        }
    }
    return Promise.resolve(response);
};


export const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
};
