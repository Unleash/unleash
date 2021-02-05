export const AUTH_REQUIRED = 'AUTH_REQUIRED';
export const FORBIDDEN = 'FORBIDDEN';

export function dispatchAndThrow(dispatch, type) {
    return error => {
        switch (error.statusCode) {
            case 401:
                dispatch({ type: AUTH_REQUIRED, error, receivedAt: Date.now() });
                break;
            case 403:
                dispatch({ type: FORBIDDEN, error, receivedAt: Date.now() });
                break;
            default:
                dispatch({ type, error, receivedAt: Date.now() });
                break;
        }
        throw error;
    };
}

export const success = (dispatch, type, val) => value => dispatch({ type, value: val ? val : value });
