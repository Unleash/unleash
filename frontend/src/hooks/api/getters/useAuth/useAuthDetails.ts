import {
    IAuthEndpointDetailsResponse,
    useAuthEndpoint,
} from './useAuthEndpoint';

interface IUseAuthDetailsOutput {
    authDetails?: IAuthEndpointDetailsResponse;
    refetchAuthDetails: () => void;
    loading: boolean;
    error?: Error;
}

export const useAuthDetails = (): IUseAuthDetailsOutput => {
    const auth = useAuthEndpoint();
    const authDetails =
        auth.data && 'type' in auth.data ? auth.data : undefined;

    return {
        authDetails,
        refetchAuthDetails: auth.refetchAuth,
        loading: auth.loading,
        error: auth.error,
    };
};
