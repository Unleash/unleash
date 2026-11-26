export type RemoteData<T = undefined, E = Error> =
    | { state: 'error'; error: E }
    | { state: 'loading' }
    | { state: 'success'; data: T };
