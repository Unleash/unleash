import { USER_CACHE_KEY } from '../../../hooks/api/getters/useUser/useUser';
import { mutate, SWRConfig, useSWRConfig } from 'swr';
import { useHistory } from 'react-router';
import useToast from '../../../hooks/useToast';
import { formatApiPath } from '../../../utils/format-path';

interface ISWRProviderProps {
    setShowLoader: React.Dispatch<React.SetStateAction<boolean>>;
    isUnauthorized: () => boolean;
}

const INVALID_TOKEN_ERROR = 'InvalidTokenError';

const SWRProvider: React.FC<ISWRProviderProps> = ({
    children,
    isUnauthorized,
    setShowLoader,
}) => {
    const { cache } = useSWRConfig();
    const history = useHistory();
    const { setToastApiError } = useToast();

    const handleFetchError = error => {
        setShowLoader(false);
        if (error.status === 401) {
            const path = location.pathname;
            // Only populate user with authDetails if 401 and
            // error is not invalid token
            if (error?.info?.name !== INVALID_TOKEN_ERROR) {
                mutate(USER_CACHE_KEY, { ...error.info }, false);
            }

            if (
                path === formatApiPath('login') ||
                path === formatApiPath('new-user') ||
                path === formatApiPath('reset-password')
            ) {
                return;
            }

            cache.clear();

            history.push('/login');
            return;
        }

        if (!isUnauthorized()) {
            setToastApiError(error.message);
        }
    };

    return (
        <SWRConfig
            value={{
                onErrorRetry: (
                    error,
                    _key,
                    _config,
                    revalidate,
                    { retryCount }
                ) => {
                    // Never retry on 404 or 401.
                    if (error.status < 499) {
                        return error;
                    }

                    setTimeout(() => revalidate({ retryCount }), 5000);
                },
                onError: handleFetchError,
            }}
        >
            {children}
        </SWRConfig>
    );
};

export default SWRProvider;
