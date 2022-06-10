import { useCallback, useContext } from 'react';
import UIContext from '../contexts/UIContext';
import { IToast } from '../interfaces/toast';

const useToast = () => {
    const { setToast } = useContext(UIContext);

    const hideToast = () =>
        setToast((prev: IToast) => ({
            ...prev,
            show: false,
        }));

    const setToastApiError = useCallback(
        (text: string, overrides?: IToast) => {
            setToast({
                title: 'Something went wrong',
                text,
                type: 'error',
                show: true,
                autoHideDuration: 12000,
                ...overrides,
            });
        },
        [setToast]
    );

    const setToastData = useCallback(
        (toast: IToast) => {
            if (toast.persist) {
                setToast({ ...toast, show: true });
            } else {
                setToast({ ...toast, show: true, autoHideDuration: 6000 });
            }
        },
        [setToast]
    );

    return { setToastData, setToastApiError, hideToast };
};

export default useToast;
