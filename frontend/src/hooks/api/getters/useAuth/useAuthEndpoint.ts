import useSWR, { mutate } from 'swr';
import { useCallback } from 'react';
import { formatApiPath } from 'utils/formatPath';
import { IPermission, IUser } from 'interfaces/user';

// The auth endpoint returns different things depending on the auth status.
// When the user is logged in, the endpoint returns user data and permissions.
// When the user is logged out, the endpoint returns details on how to log in.
type AuthEndpointResponse =
    | IAuthEndpointUserResponse
    | IAuthEndpointDetailsResponse;

export interface IAuthEndpointUserResponse {
    user: IUser;
    feedback: IAuthFeedback[];
    permissions: IPermission[];
    splash: IAuthSplash;
}

export interface IAuthEndpointDetailsResponse {
    type: string;
    path: string;
    message: string;
    defaultHidden: boolean;
    options: IAuthOptions[];
}

export interface IAuthOptions {
    type: string;
    message: string;
    path: string;
}

export interface IAuthFeedback {
    neverShow: boolean;
    feedbackId: string;
    given?: string;
    userId: number;
}

export interface IAuthSplash {
    [key: string]: boolean;
}

interface IUseAuthEndpointOutput {
    data?: AuthEndpointResponse;
    refetchAuth: () => void;
    loading: boolean;
    error?: Error;
}

// This helper hook returns the raw response data from the user auth endpoint.
// Check out the other hooks in this directory for more ergonomic alternatives.
export const useAuthEndpoint = (): IUseAuthEndpointOutput => {
    const { data, error } = useSWR<AuthEndpointResponse>(
        USER_ENDPOINT_PATH,
        fetchAuthStatus,
        swrConfig
    );

    const refetchAuth = useCallback(() => {
        mutate(USER_ENDPOINT_PATH).catch(console.warn);
    }, []);

    return {
        data,
        refetchAuth,
        loading: !error && !data,
        error,
    };
};

const fetchAuthStatus = (): Promise<AuthEndpointResponse> => {
    return fetch(USER_ENDPOINT_PATH).then(res => res.json());
};

const swrConfig = {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 15000,
};

export const USER_ENDPOINT_PATH = formatApiPath(`api/admin/user`);
