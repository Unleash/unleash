// Failed-outcome props for mutation tracking; useAPI's typed errors carry
// statusCode, its generic ones don't — errorStatus absent then.
type RequestFailureProps = { failedOn: 'request'; errorStatus?: number };

export const requestFailureProps = (error: unknown): RequestFailureProps => ({
    failedOn: 'request',
    ...(error instanceof Error &&
    'statusCode' in error &&
    typeof error.statusCode === 'number'
        ? { errorStatus: error.statusCode }
        : {}),
});

// Dialogs report why an attempt failed without knowing how it is tracked.
export type FailureProps = RequestFailureProps | { failedOn: 'validation' };
