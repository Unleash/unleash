export const AUTH_REQUIRED = 'AUTH_REQUIRED';
export const FORBIDDEN = 'FORBIDDEN';

export function dispatchAndThrow(dispatch, type) {
    return error => {
        if (error.statusCode === 401) {
            dispatch({ type: AUTH_REQUIRED, error, receivedAt: Date.now() });
        } else if (error.statusCode === 403) {
            dispatch({ type: FORBIDDEN, error, receivedAt: Date.now() });
        } else {
            dispatch({ type, error, receivedAt: Date.now() });
        }
    };
}
