import { USER_CACHE_KEY } from '../../../hooks/api/getters/useUser/useUser';
import { mutate, SWRConfig, useSWRConfig } from 'swr';
import { useHistory } from 'react-router';
import { IToast } from '../../../hooks/useToast';

interface ISWRProviderProps {
    setToastData: (toastData: IToast) => void;
    setShowLoader: React.Dispatch<React.SetStateAction<boolean>>;
    isUnauthorized: () => boolean;
}

const INVALID_TOKEN_ERROR = 'InvalidTokenError';

const SWRProvider: React.FC<ISWRProviderProps> = ({
    children,
    setToastData,
    isUnauthorized,
    setShowLoader,
}) => {
    const { cache } = useSWRConfig();
    const history = useHistory();

    const handleFetchError = error => {
        setShowLoader(false);
        console.log(error.info.name);
        if (error.status === 401) {
            cache.clear();
            const path = location.pathname;
            // Only populate user with authDetails if 401 and
            // error is not invalid token
            if (error?.info?.name !== INVALID_TOKEN_ERROR) {
                mutate(USER_CACHE_KEY, { ...error.info }, false);
            }
            if (path === '/login') {
                return;
            }

            history.push('/login');
            return;
        }

        if (!isUnauthorized()) {
            setToastData({
                show: true,
                type: 'error',
                text: error.message,
            });
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
