import useSWR, { mutate } from 'swr';
import { useCallback } from 'react';
import { formatApiPath } from 'utils/formatPath';
import type { IPermission, IUser } from 'interfaces/user';

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
    feedbackId: string;
    neverShow?: boolean;
    given?: string;
    userId?: number;
}

export interface IAuthSplash {
    [key: string]: boolean;
}

export interface IUseAuthEndpointOutput {
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
        swrConfig,
    );

    const refetchAuth = useCallback(
        async () => mutate(USER_ENDPOINT_PATH).catch(console.warn),
        [],
    );

    return {
        data,
        refetchAuth,
        loading: !error && !data,
        error,
    };
};

// fetches the auth status with retry logic for session termination
const fetchAuthStatus = async (): Promise<AuthEndpointResponse> => {
    let response = await fetch(USER_ENDPOINT_PATH).then((res) => res.json());

    const isValid =
        response &&
        typeof response === 'object' &&
        ('user' in response || 'type' in response);

    if (isValid) {
        return response;
    }

    // retry once if session ended
    if (response?.name === 'SessionEndedError') {
        response = await fetch(USER_ENDPOINT_PATH).then((res) => res.json());

        if (
            response &&
            typeof response === 'object' &&
            ('user' in response || 'type' in response)
        ) {
            return response;
        }
    }

    throw new Error('Failed to fetch auth status', {
        cause: response,
    });
};

const swrConfig = {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 15000,
};

export const USER_ENDPOINT_PATH = formatApiPath(`api/admin/user`);
